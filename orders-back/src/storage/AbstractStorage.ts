import {EID} from "../types/core_types";
import {GoodModel, OrderModel, POSModel, UserModel} from "../types/domain_types";

// Defines abstract storage interface.
interface AbstractStorage {
  insertGood(productID: EID, good: GoodModel): Promise<void>;
  getGoodByID(id: EID): Promise<GoodModel>;
  getAllGoods(): Promise<ReadonlyArray<GoodModel>>;
  updateGood(id: EID, cb: (good: GoodModel) => GoodModel): Promise<void>;
  insertPointOfSale(posID: EID, posModel: POSModel): Promise<void>;
  getPointOfSale(posID: EID): Promise<POSModel>;
  getAllPointsOfSale(): Promise<ReadonlyArray<POSModel>>;
  insertOrder(orderID: EID, rderModel: OrderModel): Promise<void>;
  getOrders(from: Date, to: Date): Promise<OrderModel[]>;
  insertUser(userID: EID, userModel: UserModel): Promise<void>;
  getUser(userID: EID): Promise<UserModel>;
  updateUser(userID: EID, cb: (user: UserModel) => void): Promise<void>;
  getAllUsers(): Promise<ReadonlyArray<UserModel>>;
  findUserByIdName(idName: string): Promise<UserModel|undefined>;
}

export {AbstractStorage};
