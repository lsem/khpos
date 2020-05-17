import { AbstractStorage } from "./AbstractStorage";
import { EntityID } from "../types/core_types";
import { POSModel, UserModel, OrderModel, ProductModel } from "../types/domain_types";
import _ from "lodash";

class InMemoryStorage implements AbstractStorage {
  users = new Map<EntityID, UserModel>();
  poss = new Map<EntityID, POSModel>();
  orders = new Map<EntityID, OrderModel>();
  products = new Map<EntityID, ProductModel>();

  async insertProduct(productID: EntityID, productModel: ProductModel): Promise<void> {
    // todo: validate that not exists.
    this.products.set(productID, productModel);
  }

  async getProductByID(id: EntityID): Promise<ProductModel> {
    if (!this.products.has(id)) {
      throw new Error("Does not exists!")
    }
    return this.products.get(id)!
  }

  async insertPointOfSale(posID: EntityID, posModel: POSModel): Promise<void> {
    this.poss.set(posID, posModel);
  }

  async getPointOfSale(posID: EntityID): Promise<POSModel> {
    if (!this.poss.has(posID)) {
      throw new Error("Does not exists!");
    }
    return this.poss.get(posID)!;    
  }

  getAllPointsOfSale(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async insertOrder(orderID: EntityID, orderModel: OrderModel): Promise<void> {
    this.orders.set(orderID, orderModel);
  }

  async getOrders(from: Date, to: Date): Promise<OrderModel[]> {
    const truncateTime = (d1: Date): Date => {
      return new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
    };
    from = truncateTime(from);
    to = truncateTime(to);
    let results: OrderModel[] = [];
    for (const [id, model] of this.orders.entries()) {
      const modelToDate = truncateTime(model.toDate);
      if (modelToDate >= from && modelToDate <= to) {
        results.push(_.clone(model));
      }
    }
    return results;
  }

  async insertUser(userID: EntityID, userModel: UserModel): Promise<void> {
    this.users.set(userID, userModel);
  }
  getUsers(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

export { InMemoryStorage };
