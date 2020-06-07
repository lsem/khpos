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
    this.goods.set(productID, good);
  }

  async getGoodByID(id: EID): Promise<GoodModel> {
    if (!this.goods.has(id)) {
      throw new NotFoundError('Good: ' + id);
    }
    return this.goods.get(id)!
  }

  async getAllGoods(): Promise<ReadonlyArray<GoodModel>> {
    return _.cloneDeep(Array.from(this.goods.values()));
  }

  async updateGood(id: EID, cb: (good: GoodModel) => GoodModel): Promise<void> {
    if (!this.goods.has(id)) {
      throw new NotFoundError();
    }
    const newGood = cb(this.goods.get(id)!);
    if (newGood.id !== id) {
      throw new Error("Changing ID is not allowed");
    }
    this.goods.set(id, newGood);
  }

  //#endregion

  //#region POS
  async insertPointOfSale(posID: EID, posModel: POSModel): Promise<void> {
    if (this.poss.has(posID)) {
      throw new AlreadyExistsError("POS with ID " + posID);
    }
    this.poss.set(posID, posModel);
  }

  async getPointOfSale(posID: EID): Promise<POSModel> {
    if (!this.poss.has(posID)) {
      throw new NotFoundError("POS with ID " + posID);
    }
    return this.poss.get(posID)!;
  }

  async getAllPointsOfSale(): Promise<ReadonlyArray<POSModel>> {
    return Array.from(this.poss.values());
  }
  //#endregion

  //#region Orders
  async insertOrder(orderID: EID, orderModel: OrderModel): Promise<void> {
    this.orders.set(orderID, orderModel);
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
    this.users.set(userID, userModel);
  }
  async getAllUsers(): Promise<readonly UserModel[]> { return Array.from(this.users.values()); }

  async getUser(userID: EID): Promise<UserModel> {
    if (!this.users.has(userID)) {
      // todo: fix this
      throw new Error('User does not exist');
    }
    // todo: return clone! add test!
    return this.users.get(userID)!;
  }

  async updateUser(userID: EID, cb: (user: UserModel) => void): Promise<void> {
    if (!this.users.has(userID)) {
      throw new NotFoundError();
    }
    const fetchedUser = _.clone(this.users.get(userID)!);
    cb(fetchedUser);
    this.users.set(userID, fetchedUser);
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

  async updateOrderForDay(day: Day, posID: EID,
                          cb: (order: DayOrderModel) => DayOrderModel): Promise<void> {
    const key = makeKey(day, posID);
    if (!this.dayOrders.get(key)) {
      throw new NotFoundError(`day/pos ${key} to update`);
    }
    const order = this.dayOrders.get(key)!;
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
