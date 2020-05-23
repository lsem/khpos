import { AbstractStorage } from "./AbstractStorage";
import { EntityID } from "../types/core_types";
import { POSModel, UserModel } from "../types/domain_types";

class InMemoryStorage implements AbstractStorage {
  private users: Map<EntityID, UserModel> = new Map<EntityID, UserModel>()
  private poss: Map<EntityID, POSModel> = new Map<EntityID, POSModel>()

  async insertPointOfSale(posID: EntityID, posModel: POSModel): Promise<void> {
    this.poss.set(posID, posModel)
  }
  getAllPointsOfSale(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  insertOrder(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  getOrders(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async insertUser(userID: EntityID, userModel: UserModel): Promise<void> {
    this.users.set(userID, userModel);
  }
  getUsers(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

export { InMemoryStorage };
