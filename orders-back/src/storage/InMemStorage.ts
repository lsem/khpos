import {AlreadyExistsError, NotFoundError} from "app/errors";
import _ from "lodash";

import {Day, EID} from "../types/core_types";
import {DayOrderModel, GoodModel, OrderModel, POSModel, UserModel} from "../types/domain_types";

import {AbstractStorage} from "./AbstractStorage";

function makeKey(day: Day, posID: EID) { return `${day.val.toString()}-${posID}`; }

class InMemoryStorage implements AbstractStorage {
  users = new Map<string, UserModel>();
  poss = new Map<string, POSModel>();
  orders = new Map<string, OrderModel>();
  goods = new Map<string, GoodModel>();
  dayOrders = new Map<string, DayOrderModel>();

  //#region Goods
  async insertGood(productID: EID, good: GoodModel): Promise<void> {
    // todo: validate that not exists.
    // todo: should I clone good here?
    this.goods.set(productID.value, good);
  }

  async getGoodByID(id: EID): Promise<GoodModel> {
    if (!this.goods.has(id.value)) {
      throw new NotFoundError('Good: ' + id.value);
    }
    return this.goods.get(id.value)!
  }

  async getAllGoods(): Promise<ReadonlyArray<GoodModel>> {
    return _.cloneDeep(Array.from(this.goods.values()));
  }

  async updateGood(id: EID, cb: (good: GoodModel) => GoodModel): Promise<void> {
    if (!this.goods.has(id.value)) {
      throw new NotFoundError();
    }
    const newGood = cb(this.goods.get(id.value)!);
    if (newGood.id !== id) {
      throw new Error("Changing ID is not allowed");
    }
    this.goods.set(id.value, newGood);
  }

  //#endregion

  //#region POS
  async insertPointOfSale(posID: EID, posModel: POSModel): Promise<void> {
    if (this.poss.has(posID.value)) {
      throw new Error("Already exists");
    }
    this.poss.set(posID.value, posModel);
  }

  async getPointOfSale(posID: EID): Promise<POSModel> {
    if (!this.poss.has(posID.value)) {
      throw new Error("Does not exists!");
    }
    return this.poss.get(posID.value)!;
  }

  async getAllPointsOfSale(): Promise<ReadonlyArray<POSModel>> {
    return Array.from(this.poss.values());
  }
  //#endregion

  //#region Orders
  async insertOrder(orderID: EID, orderModel: OrderModel): Promise<void> {
    this.orders.set(orderID.value, orderModel);
  }

  async getOrders(from: Date, to: Date): Promise<OrderModel[]> {
    const truncateTime =
        (d1: Date): Date => { return new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()); };
    from = truncateTime(from);
    to = truncateTime(to);
    let results: OrderModel[] = [];
    for (const [id, model] of this.orders.entries()) {
      const modelToDate = truncateTime(model.toDate);
      if (modelToDate >= from && modelToDate <= to) {
        // todo: for some reason changing to cloneDeep here breakes one of the test.
        results.push(_.clone(model));
      }
    }
    return results;
  }
  //#endregion

  //#region  Users
  async insertUser(userID: EID, userModel: UserModel): Promise<void> {
    this.users.set(userID.value, userModel);
  }
  async getAllUsers(): Promise<readonly UserModel[]> { return Array.from(this.users.values()); }

  async getUser(userID: EID): Promise<UserModel> {
    if (!this.users.has(userID.value)) {
      // todo: fix this
      throw new Error('User does not exist');
    }
    // todo: return clone! add test!
    return this.users.get(userID.value)!;
  }

  async updateUser(userID: EID, cb: (user: UserModel) => void): Promise<void> {
    if (!this.users.has(userID.value)) {
      throw new NotFoundError();
    }
    const fetchedUser = _.clone(this.users.get(userID.value)!);
    cb(fetchedUser);
    this.users.set(userID.value, fetchedUser);
  }

  async findUserByIdName(idName: string): Promise<UserModel|undefined> {
    const maybeUser = _.find(Array.from(this.users.values()),
                             (u: UserModel) => { return u.userIdName == idName; });
    return maybeUser;
  }

  //#endregion

  async insertOrderForDay(day: Day, posID: EID, order: DayOrderModel): Promise<void> {
    const key = makeKey(day, posID);
    if (this.dayOrders.get(key)) {
      throw new AlreadyExistsError();
    }
    this.dayOrders.set(key, order);
  }

  async getOrderForDay(day: Day, posID: EID): Promise<DayOrderModel|undefined> {
    const key = makeKey(day, posID);
    if (this.dayOrders.get(key)) {
      return this.dayOrders.get(key)!;
    } else {
      return undefined;
    }
  }

  async updateOrderForDay(day: Day, cb: (order: DayOrderModel) => DayOrderModel): Promise<void> {
    const key = day.val.toString();
    if (!this.dayOrders.get(key)) {
      throw new NotFoundError();
    }
    const order = this.dayOrders.get(day.val.toString())!;
    const changedOrder = cb(order);
    this.dayOrders.set(key, changedOrder);
  }

  async replaceOrderForDay(day: Day, posID: EID, model: DayOrderModel): Promise<void> {
    const key = makeKey(day, posID);
    if (!this.dayOrders.get(key)) {
      throw new NotFoundError();
    }
    this.dayOrders.set(key, model);
  }
}

export {InMemoryStorage};
