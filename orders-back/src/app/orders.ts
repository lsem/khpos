import * as joi from "joi";
import _ from "lodash";
import {Caller} from "types/Caller";
import {Day, EID} from "types/core_types";
import {
  DayOrderItem,
  DayOrderModel,
  DayStatus,
  GoodModel,
  OrderModel,
  OrderModelItem
} from "types/domain_types";
import {PermissionFlags} from "types/UserPermissions";

import {AbstractStorage} from "../storage/AbstractStorage";
import * as schemas from "../types/schemas";

import {
  callerHasAccessToResource,
  ensureCallToSelfOrAdmin,
  ensureHasAccessToPOSOrAdmin,
  isAdmin
} from "./ensure";
import {
  InvalidOperationError as InvalidOperationError,
  NotAllowedError,
  NotFoundError
} from "./errors";
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
  const newOrderID = EID.makeOrderID();
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

export interface DayViewModel {
  status: DayStatus;
  items: ReadonlyArray<{goodID : EID; goodName : string; ordered : number; units : string}>
}

export interface ChangeDayViewModel {
  items: ReadonlyArray<{goodID : EID; ordered : number;}>
}

async function viewModelForDay(storage: AbstractStorage,
                               model: DayOrderModel): Promise<DayViewModel> {
  type OneItem = DayViewModel['items'][0];
  const viewItems =
      await Promise.all(_.map(model.items, async(item: DayOrderItem): Promise<OneItem> => {
        const good = await storage.getGoodByID(item.goodID);
        return {
          goodID : item.goodID,
          goodName : good.name,
          ordered : item.ordered,
          units : good.units
        };
      }));
  return {status : model.status, items : viewItems};
}

export async function getDay(storage: AbstractStorage, caller: Caller, day: Day,
                             posID: EID): Promise<DayViewModel> {
  // todo: here authentication check is missing but it looks not as bad.
  const maybeOrder = await storage.getOrderForDay(day, posID);
  if (!maybeOrder) {
    return { status: DayStatus.not_opened, items: [] }
  }
  return viewModelForDay(storage, maybeOrder!);
}

// Openning day means that we create order from currently available goods with all zeoros.
export async function openDay(storage: AbstractStorage, caller: Caller, day: Day,
                              posID: EID): Promise<void> {
  ensureHasAccessToPOSOrAdmin(caller, posID);

  if (day.val < Day.today().val) {
    throw new InvalidOperationError("Openning past days not allowed");
  }
  if ((day.val - Day.today().val) > 31) {
    throw new InvalidOperationError("Can't create order for more than 31 days ahead");
  }
  const existingOrder = await storage.getOrderForDay(day, posID);
  if (existingOrder) {
    throw new InvalidOperationError("Day already epened");
  }
  const goods = _.filter(await storage.getAllGoods(), (g) => !g.removed && g.available);
  const items =
      _.map(goods, (g: GoodModel): DayOrderItem => { return {goodID : g.id, ordered : 0}; });
  await storage.insertOrderForDay(day, posID, {status : DayStatus.openned, items : items});
}

export async function closeDay(storage: AbstractStorage, caller: Caller, day: Day, posID: EID) {
  if (!isAdmin(caller) && (caller.Permissions.mask & PermissionFlags.IsProdStaff) == 0) {
    throw new NotAllowedError(`closing day ${day.val}`);
  }
  // todo: add tes for this
  const dayModel = await storage.getOrderForDay(day, posID);
  if (!dayModel) {
    throw new InvalidOperationError(`day must be openned to close it`);
  }
  await storage.updateOrderForDay(day, posID, (dayModel) => {
    // todo: add test
    if (dayModel.status !== DayStatus.openned) {
      throw new InvalidOperationError(`day must be openned to close it`);
    }
    return { status: DayStatus.closed, items: dayModel.items }
  });
}

export async function finalizeDay(storage: AbstractStorage, caller: Caller, day: Day, posID: EID) {
  if (!isAdmin(caller) && (caller.Permissions.mask & PermissionFlags.IsShopManager) == 0) {
    throw new NotAllowedError(`closing day ${day.val}`);
  }
  ensureHasAccessToPOSOrAdmin(caller, posID);

  const dayModel = await storage.getOrderForDay(day, posID);
  if (!dayModel) {
    throw new InvalidOperationError(`day must be openned to finalize it`);
  }

  // todo add test that natasha can close, while production stuff cannot.
  await storage.updateOrderForDay(day, posID, (dayModel) => {
    // todo: add test
    if (dayModel.status !== DayStatus.closed) {
      throw new InvalidOperationError(`day must be closed to finalize it`);
    }
    return { status: DayStatus.finalized, items: dayModel.items }
  });
}

// Accepts edited previously returned from getGoodsForDay. Client can send
// only that items that were changed or entire set.
export async function changeDay(storage: AbstractStorage, caller: Caller, day: Day, posID: EID,
                                changeViewModel: ChangeDayViewModel): Promise<void> {
  if (!(isAdmin(caller) || ((caller.Permissions.mask & PermissionFlags.IsProdStaff) > 0) ||
        (((caller.Permissions.mask & PermissionFlags.IsShopManager) > 0) &&
         callerHasAccessToResource(caller, posID)))) {
    throw new NotAllowedError("to change day");
  }

  const maybeDay = await storage.getOrderForDay(day, posID);
  if (!maybeDay) {
    throw new InvalidOperationError(`day must be openned to change it`);
  }

  if (maybeDay.status !== DayStatus.openned) {
    throw new InvalidOperationError("cannot change status in non-openned status");
  }

  // todo: handle changed to already closed order which must be something like that:
  //   if it is already closed. then, we should mark desired change and notify stakeholders
  //   about it. this change can be later accepted or not.
  //   Apart from this, this should invalidate views of subscribed parties which should receive
  //   notfication.
  // todo: handle concurrency issue
  for (let x of changeViewModel.items) {
    const goodInOrder = _.find(maybeDay!.items, {goodID : x.goodID})
    if (!goodInOrder) {
      throw new InvalidOperationError(
          `Attempt to change item ${x.goodID} that is not available in order`);
    }
    if (goodInOrder!.ordered != x.ordered) {
      // changed, validate it.
      if (x.ordered < 0) {
        throw new InvalidOperationError(`Changing ${x.goodID} to value ${x.ordered} not allowed`);
      }
      // todo: min/max?
      // todo: raise event?
      goodInOrder.ordered = x.ordered;
    }
  }
  // todo: handle concurrency issue
  await storage.replaceOrderForDay(day, posID, maybeDay!);
}

// Returns grouped summary for all pos.
export async function getTotalGoodsForDay() {}
