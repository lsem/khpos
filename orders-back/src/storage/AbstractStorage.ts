import {EntityID} from "../types/core_types";
import {GoodModel, OrderModel, POSModel, UserModel} from "../types/domain_types";

// Defines abstract storage interface.
interface AbstractStorage {
  insertGood(productID: EntityID, good: GoodModel): Promise<void>;
  getGoodByID(id: EntityID): Promise<GoodModel>;
  getAllGoods(): Promise<ReadonlyArray<GoodModel>>;
  updateGood(id: EntityID, cb: (good: GoodModel) => GoodModel): Promise<void>;
  insertPointOfSale(posID: EntityID, posModel: POSModel): Promise<void>;
  getPointOfSale(posID: EntityID): Promise<POSModel>;
  getAllPointsOfSale(): Promise<ReadonlyArray<POSModel>>;
  insertOrder(orderID: EntityID, rderModel: OrderModel): Promise<void>;
  getOrders(from: Date, to: Date): Promise<OrderModel[]>;
  insertUser(userID: EntityID, userModel: UserModel): Promise<void>;
  getUser(userID: EntityID): Promise<UserModel>;
  updateUser(userID: EntityID, cb: (user: UserModel) => void): Promise<void>;
  getAllUsers(): Promise<ReadonlyArray<UserModel>>;
  findUserByIdName(idName: string): Promise<UserModel|undefined>;
}

export {AbstractStorage};
