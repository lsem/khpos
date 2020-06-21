import {EventEmitter} from "events";
import * as joi from "joi";
import _ from "lodash";
import {InMemoryStorage} from "storage/InMemStorage";
import {Caller} from "types/Caller";
import {Day, EID, EIDFac} from "types/core_types";
import {
  DayOrderItem,
  DayOrderModel,
  DayStatus,
  GoodModel,
  OrderModel,
  OrderModelItem
} from "types/domain_types";
import {PermissionFlags} from "types/UserPermissions";
import {
  ChangeDayViewModel,
  ConfirmChangeViewModel,
  DayTotalViewModel,
  DayTotalViewModelItem,
  DayViewModel
} from "types/viewModels";

import {AbstractStorage} from "../storage/AbstractStorage";
import * as schemas from "../types/schemas";

import {
  callerHasAccessToResource,
  ensureCallToSelfOrAdmin,
  ensureHasAccessToPOSOrAdmin,
  isAdmin
} from "./ensure";
import {
  AlreadyExistsError,
  InvalidOperationError as InvalidOperationError,
  NotAllowedError,
  NotFoundError
} from "./errors";
import {getAllPOS} from "./pos";
import {UserIDSchema} from "./user_schemas";

// TODO: Move to separate features.
const POSIDSchema = schemas.TypedUUIDSchema("POS");
const ProductIDSchema = schemas.TypedUUIDSchema("PRO");

const OrderItemSchema = joi.object().keys({
  productID : ProductIDSchema,
  count : joi.number().integer(), // todo: find out what is it
});

const OrderModelSchema = joi.object().keys({
  dateCreated : schemas.DateSchema,
  dateOrderFor : schemas.DateSchema,
  placedByUID : UserIDSchema,
  customerPOSID : POSIDSchema,
  items : joi.array().items(OrderItemSchema).required(),
});

export async function placeOrder(storage: AbstractStorage, orderData: OrderModel) {
  const newOrderID = EIDFac.makeOrderID();
  storage.insertOrder(newOrderID, orderData);
  return newOrderID;
}

export interface CombinedOrderView {
  toDate: Date;
  items: ReadonlyArray<{
    productName : string; productID : EID; count : number;
    details : ReadonlyArray<{count : number, posIDName: string, posID: EID}>;
  }>;
}

export async function getOrdersForDate(storage: AbstractStorage,
                                       date: Date): Promise<CombinedOrderView> {
  joi.assert(date, schemas.DateSchema);

  let items: Array<CombinedOrderView['items'][0]> = [];

  let itemContsByGoodID = new Map<EID, number>();
  let itemDetailsByGoodID = new Map<EID, Array<CombinedOrderView['items'][0]['details'][0]>>();

  // Get all orders for all POSs for given date and produce combined POSs.
  const orders = await storage.getOrders(date, date);
  for (const order of orders) {
    for (const item of order.items) {
      if (!itemContsByGoodID.has(item.id)) {
        itemContsByGoodID.set(item.id, 0)
      }
      itemContsByGoodID.set(item.id, itemContsByGoodID.get(item.id)! + item.count);
      if (!itemDetailsByGoodID.has(item.id)) {
        itemDetailsByGoodID.set(item.id, []);
      }
      itemDetailsByGoodID.get(item.id)!.push({
        count : item.count,
        posID : order.posID,
        posIDName : (await storage.getPointOfSale(order.posID)).posIDName
      })
    }
  }

  for (const [goodID, count] of itemContsByGoodID.entries()) {
    items.push({
      productID : goodID,
      productName : (await storage.getGoodByID(goodID)).name,
      count : count,
      details : itemDetailsByGoodID.get(goodID)!
    });
  }

  let result: CombinedOrderView = {
    toDate : date,
    items : items,
  };

  return result;
}

export async function getTotalForDay(storage: AbstractStorage, caller: Caller,
                                     day: Day): Promise<DayTotalViewModel> {

  // todo: write test for permissions check
  if (!isAdmin(caller) && (caller.Permissions.mask & PermissionFlags.IsProdStaff) == 0) {
    throw new NotAllowedError(`closing day ${day.val}`);
  }

  // todo: handle non-opened day, must be already closed.

  const poss = await storage.getAllPointsOfSale()
  const dayAggregates = await Promise.all(_.map(poss, async(pos): Promise<DayAggregateItem[]> => {
    try {
      const dayAggregate = await loadDayAggregate(storage, day, pos.posID);
      return _.values(dayAggregate.items);
    } catch (err) {
      // day not opened, does not exist.
      if (err instanceof NotFoundError) {
        return [];
      } else {
        throw err;
      }
    }
  }));

  const totals: Dict<DayTotalViewModelItem> = {};
  for (let agg of dayAggregates) {
    for (let x of agg) {
      if (!totals[x.good]) {
        const good = await storage.getGoodByID(x.good); // todo: check if it is parallel
        totals[x.good] = {goodID : x.good, goodName : good.name, units : good.units, ordered : 0};
      }
      totals[x.good].ordered += x.amount;
    }
  }
  const items: DayTotalViewModelItem[] = _.values(totals);
  return {items : items};
}

async function viewModelForDay(storage: AbstractStorage,
                               dayAggregate: DayAggregate): Promise<DayViewModel> {
  type OneItem = DayViewModel['items'][0];
  type OneHistoryItem = OneItem['history'][0];
  const viewItems = await Promise.all(_.map(dayAggregate.items, async(item): Promise<OneItem> => {
    const good = await storage.getGoodByID(item.good);
    return {
      goodID : item.good,
      goodName : good.name,
      ordered : item.amount,
      units : good.units,
      status : item.status,
      history : await Promise.all(_.map(item.history, async(change): Promise<OneHistoryItem> => {
        return {
          kind: change.kind, count: change.amount, diff: change.diff, userID: change.madeBy,
              userName: (await storage.getUser(change.madeBy)).userIdName,
              whenTS: change.whenTS.toISOString()
        }
      }))
    };
  }));
  return {status : dayAggregate.status, items : viewItems};
}

export async function getDay(storage: AbstractStorage, caller: Caller, day: Day,
                             posID: EID): Promise<DayViewModel> {
  // todo: here authentication check is missing but it looks not as bad.
  let dayAggregate = null;
  try {
    dayAggregate = await loadDayAggregate(storage, day, posID);
  } catch (e) {
    if (e instanceof NotFoundError) {
      return {status : DayStatus.not_opened, items : []};
    } else {
      throw e;
    }
  }
  return await viewModelForDay(storage, dayAggregate);
}

export async function openDay(storage: AbstractStorage, caller: Caller, day: Day,
                              posID: EID): Promise<void> {
  // Call to POS to verify this POS exists (todo: verify if this is ok)
  await storage.getPointOfSale(posID);

  // how to verify that this one does not exist yet?
  try {
    await loadDayAggregate(storage, day, posID);
    throw new InvalidOperationError("cannot open day that is already open");
  } catch (e) {
    if (!(e instanceof NotFoundError)) {
      throw e;
    }
  }

  const goods = _.filter(await storage.getAllGoods(), (g) => !g.removed && g.available);
  const goodIDS = _.map(goods, (g) => g.id);

  const aggregate = DayAggregate.create(posID, caller, day, goodIDS);
  await saveDayAggregate(storage, aggregate);
}

export async function closeDay(storage: AbstractStorage, caller: Caller, day: Day, posID: EID) {
  await storage.getPointOfSale(posID);
  const dayAggregate = await loadDayAggregateRemapNotFound(
      storage, day, posID, new InvalidOperationError(`day must be openned to close it`));
  dayAggregate.closeDay(caller);
  await saveDayAggregate(storage, dayAggregate);
}

export async function finalizeDay(storage: AbstractStorage, caller: Caller, day: Day, posID: EID) {
  await storage.getPointOfSale(posID);
  const dayAggregate = await loadDayAggregateRemapNotFound(
      storage, day, posID, new InvalidOperationError(`day must be openned to finalize it`));
  dayAggregate.finalizeDay(caller);
  await saveDayAggregate(storage, dayAggregate);
}

export async function changeDay(storage: AbstractStorage, caller: Caller, day: Day, posID: EID,
                                changeViewModel: ChangeDayViewModel): Promise<void> {
  // todo: missing test, POS id may not exist
  const dayAggregate = await loadDayAggregateRemapNotFound(
      storage, day, posID, new InvalidOperationError(`day must be openned to change it`));
  type OneItemT = ChangeDayViewModel['items'][0];
  const internalChanges = changeViewModel.items.map(
      (x: OneItemT): DayChange => {return { good: x.goodID, amount: x.ordered }});
  dayAggregate.editDay(caller, internalChanges);
  await saveDayAggregate(storage, dayAggregate);
}

export async function confirmChanges(storage: AbstractStorage, caller: Caller, day: Day, posID: EID,
                                     changeViewModel: ConfirmChangeViewModel) {
  const dayAggregate = await loadDayAggregateRemapNotFound(
      storage, day, posID, new InvalidOperationError(`day must be openned to change it`));
  type OneItemT = ChangeDayViewModel['items'][0];
  const confirmChanges = changeViewModel.items.map(
      (x: OneItemT): DayChangeConfirmation => {return { good: x.goodID, amount: x.ordered }});
  dayAggregate.confirmDayChanges(caller, confirmChanges);
  await saveDayAggregate(storage, dayAggregate);
}

// Returns grouped summary for all pos.
export async function getTotalGoodsForDay() {}

export enum EventType {
  DayCreated,
  DayOpened,
  DayClosed,
  DayFinalized,
  DayEdited,
  DayEditConfirmed,
  DayEditRejected
}

export class DayEvent {
  constructor(public type: EventType) {}
}

export class DayCreated extends DayEvent {
  constructor(public pos: EID, public day: Day) { super(EventType.DayCreated); }
}

export class DayOpened extends DayEvent {
  constructor(public goods: EID[]) { super(EventType.DayOpened); }
}

export class DayClosed extends DayEvent {
  constructor() { super(EventType.DayClosed); }
}

export class DayFinalized extends DayEvent {
  constructor() { super(EventType.DayFinalized); }
}

export interface DayChange {
  good: EID, amount: number
}

export interface DayChangeConfirmation {
  good: EID, amount: number
}

// Day edited keeps bulk chanbges but not individial change since
// this seems to be more natural and enables to undo entire (bulk) change operation.
export class DayEdited extends DayEvent {
  constructor(public userID: EID, public changes: DayChange[]) { super(EventType.DayEdited); }
}

export class DayEditsConfirmed extends DayEvent {
  constructor(public userID: EID, public changes: DayChangeConfirmation[]) {
    super(EventType.DayEditConfirmed);
  }
}

export class DayEditApproved extends DayEvent {
  constructor() { super(EventType.DayEditConfirmed); }
}

export class DayEditRejected extends DayEvent {
  constructor() { super(EventType.DayEditRejected); }
}

export async function loadDayAggregate(storage: AbstractStorage, day: Day,
                                       pos: EID): Promise<DayAggregate> {
  const streamID = `${day.val.toString()}-${pos}`;
  const events = await storage.fetchDayEvents(streamID);
  const dayAggregate = new DayAggregate();
  dayAggregate.applyHistory(events);
  return dayAggregate;
}

export async function saveDayAggregate(storage: AbstractStorage, aggregate: DayAggregate) {
  const expectedVersion = aggregate.version - aggregate.uncommittedEvents.length;
  const streamID = `${aggregate.day.val.toString()}-${aggregate.posID}`;
  await storage.appendDayEvents(streamID, expectedVersion, aggregate.uncommittedEvents);
}

async function loadDayAggregateRemapNotFound(storage: AbstractStorage, day: Day, posID: EID,
                                             error: Error) {
  try {
    return await loadDayAggregate(storage, day, posID);
  } catch (e) {
    if (e instanceof NotFoundError) {
      throw error;
    } else {
      throw e;
    }
  }
}

interface Dict<T> {
  [Key: string]: T;
}

type EventHandlerFn = (e: DayEvent) => void;

// Represents change events for individual item.
type ItemChangeEventKind = 'Change'|'Confirm'; // tip: can be modeled in polymorphic way if needed.
interface ItemChangeEvent {
  kind: ItemChangeEventKind;
  diff: number;
  amount: number;
  madeBy: EID;
  whenTS: Date;
}

type ItemStatus = 'Default'|'RequestedEditAfterClose'|'ConfirmedAll'|'ConfirmedSome';

interface DayAggregateItem {
  good: EID;
  amount: number;
  history: ItemChangeEvent[];
  status: ItemStatus
}

export class DayAggregate {
  version: number = 0;
  map: Dict<EventHandlerFn> = {};
  public status: DayStatus = DayStatus.not_opened;
  items: Record<EID, DayAggregateItem> = {};
  posID: EID = "";
  public uncommittedEvents: DayEvent[] = [];
  day: Day = Day.invalid();

  constructor() { this.registerEventHandlers(); }

  // Create opens the day since it seems like it does not make sense to create day without opening
  // it.
  static create(posID: EID, caller: Caller, day: Day, goodsForDay: EID[]): DayAggregate {
    // todo: make sure values are not nulls.
    ensureHasAccessToPOSOrAdmin(caller, posID);
    const dayAggregate = new DayAggregate();
    dayAggregate.raise(new DayCreated(posID, day));
    dayAggregate.openDay(caller, goodsForDay);
    return dayAggregate;
  }

  //#region Event handlers / service CQRS methods.
  applyHistory(events: DayEvent[]) {
    for (let e of events) {
      this.apply(e);
    }
  }

  raise(e: DayEvent) {
    this.apply(e);
    this.uncommittedEvents.push(e);
  }

  registerEventHandlers() {
    this.map[EventType.DayCreated.toString()] = (e) => this.onCreated(e as DayCreated);
    this.map[EventType.DayOpened.toString()] = (e) => this.onOpened(e as DayOpened);
    this.map[EventType.DayClosed.toString()] = (e) => this.onClosed(e as DayClosed);
    this.map[EventType.DayFinalized.toString()] = (e) => this.onFinalized(e as DayFinalized);
    this.map[EventType.DayEdited.toString()] = (e) => this.onEdited(e as DayEdited);
    this.map[EventType.DayEditConfirmed.toString()] = (e) =>
        this.onDayEditsConfirmed(e as DayEditsConfirmed);
  }

  apply(e: DayEvent) {
    const handler = this.map[e.type.toString()];
    // todo: verify handler exists and this method works.
    if (!handler) {
      throw new InvalidOperationError("Logic error!"); // todo: add dedicated LogicError for this
    }
    handler(e);
    this.version++;
  }

  onCreated(e: DayCreated) {
    this.status = DayStatus.not_opened;
    this.day = e.day;
    this.posID = e.pos;
  }

  onOpened(e: DayOpened) {
    for (let x of e.goods) {
      this.items[x] = {good : x, amount : 0, history : [], status : 'Default'};
    }
    this.status = DayStatus.openned;
  }
  onClosed(e: DayClosed) { this.status = DayStatus.closed; }
  onFinalized(e: DayFinalized) { this.status = DayStatus.finalized; }
  onEdited(e: DayEdited) {
    for (let change of e.changes) {
      this.items[change.good].history.push({
        kind : 'Change',
        diff : change.amount - this.items[change.good].amount,
        amount : change.amount,
        madeBy : e.userID,
        whenTS : new Date()
      });
      this.items[change.good].good = change.good;
      this.items[change.good].amount = change.amount;
      if (this.status == DayStatus.closed) {
        this.items[change.good].status = 'RequestedEditAfterClose'
      }
    }
  }
  onDayEditsConfirmed(e: DayEditsConfirmed) {
    for (let change of e.changes) {
      const item = this.items[change.good];
      if (item.amount == change.amount) {
        this.items[change.good].status = 'ConfirmedAll';
      } else {
        this.items[change.good].status = 'ConfirmedSome';
      }
      // todo: we can push entry into history but this requires a bit of chamges.
      this.items[change.good].history.push({
        kind : 'Confirm',
        diff : change.amount - this.items[change.good].amount,
        amount : change.amount,
        madeBy : e.userID,
        whenTS : new Date()
      });
      this.items[change.good].amount = change.amount;
    }
  }
  //#endregion

  itemValues() { return _.values(this.items); }

  openDay(caller: Caller, goods: EID[]) {
    ensureHasAccessToPOSOrAdmin(caller, this.posID);

    if (this.day.val < Day.today().val) {
      throw new InvalidOperationError("Openning past days not allowed");
    }
    if ((this.day.val - Day.today().val) > 31) {
      throw new InvalidOperationError("Can't create order for more than 31 days ahead");
    }
    if (this.status == DayStatus.openned) {
      throw new InvalidOperationError("Day already epened");
    }
    this.raise(new DayOpened(goods));
  }

  closeDay(caller: Caller) {
    if (!isAdmin(caller) && (caller.Permissions.mask & PermissionFlags.IsProdStaff) == 0) {
      throw new NotAllowedError(`closing day ${this.day.val}`);
    }

    if (this.status != DayStatus.openned) {
      throw new InvalidOperationError(`day must be openned to close it`);
    }

    this.raise(new DayClosed());
  }

  finalizeDay(caller: Caller) {
    if (!isAdmin(caller) && (caller.Permissions.mask & PermissionFlags.IsShopManager) == 0) {
      throw new NotAllowedError(`finalizing day ${this.day.val}`);
    }
    ensureHasAccessToPOSOrAdmin(caller, this.posID);

    if (this.status != DayStatus.closed) {
      throw new InvalidOperationError(`day must be closed to finalize it`);
    }

    this.raise(new DayFinalized());
  }

  editDay(caller: Caller, changes: DayChange[]) {
    if (!(isAdmin(caller) || ((caller.Permissions.mask & PermissionFlags.IsProdStaff) > 0) ||
          (((caller.Permissions.mask & PermissionFlags.IsShopManager) > 0) &&
           callerHasAccessToResource(caller, this.posID)))) {
      throw new NotAllowedError("to change day");
    }

    const ensureChangesReferenceExistingGoods = () => {
      for (let change of changes) {
        if (!_.find(Object.keys(this.items), _.matches(change.good))) {
          throw new InvalidOperationError(
              `Attempt to change item ${change.good} that is not available in order`);
        }
      }
    };

    if (this.status == DayStatus.openned || this.status == DayStatus.closed) {
      ensureChangesReferenceExistingGoods();
      this.raise(new DayEdited(caller.ID, changes));
      // todo: do we need to raise special event like ChangeToClosedDay to be able to catch it
      // and notify interested parties?
      // that there are changes to the order.
    } else {
      throw new InvalidOperationError("cannot change status in non-openned and non-closed status");
    }
  }

  confirmDayChanges(caller: Caller, changes: DayChangeConfirmation[]) {
    if (!isAdmin(caller) && !((caller.Permissions.mask & PermissionFlags.IsProdStaff) > 0)) {
      throw new NotAllowedError("to confirm changes");
    }

    // confirmations supposed to be relevant only for closed days.
    if (this.status != DayStatus.closed) {
      throw new InvalidOperationError("confirm relevant only for closed days");
    }

    // Ensure changes reference existing goods
    for (let change of changes) {
      // todo: use the same technique as below
      if (!_.find(Object.keys(this.items), _.matches(change.good))) {
        throw new InvalidOperationError(
            `Attempt to change item ${change.good} that is not available in order`);
      }

      console.assert(this.items[change.good]);
      if (this.items[change.good].status != 'RequestedEditAfterClose') {
        throw new InvalidOperationError(`Attempt to confirm item ${
            change.good} that has status different from RequestedEditAfterClose. Actual status: ${
            this.items[change.good].status}`)
      }
    }

    this.raise(new DayEditsConfirmed(caller.ID, changes));
  }
}
