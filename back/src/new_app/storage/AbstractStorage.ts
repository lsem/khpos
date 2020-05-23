import { EntityID } from "../types/core_types";
import { POSModel, UserModel } from "../types/domain_types";

// Defines abstract storage interface.
interface AbstractStorage {
  insertPointOfSale(userID: EntityID, posModel: POSModel): Promise<void>;
  getAllPointsOfSale(): Promise<void>;
  insertOrder(): Promise<void>;
  getOrders(): Promise<void>;
  insertUser(userID: EntityID, userModel: UserModel): Promise<void>;
  getUsers(): Promise<void>;
}

export { AbstractStorage };
