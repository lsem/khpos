import _ from "lodash";

import {EntityID} from "../types/core_types";
import {OrderModel, POSModel, ProductModel, UserModel} from "../types/domain_types";

import {AbstractStorage} from "./AbstractStorage";

class InMemoryStorage implements AbstractStorage {
  users = new Map<string, UserModel>();
  poss = new Map<string, POSModel>();
  orders = new Map<string, OrderModel>();
  products = new Map<string, ProductModel>();

  //#region Products
  async insertProduct(productID: EntityID, productModel: ProductModel): Promise<void> {
    // todo: validate that not exists.
    this.products.set(productID.value, productModel);
  }

  async getProductByID(id: EntityID): Promise<ProductModel> {
    if (!this.products.has(id.value)) {
      throw new Error("Does not exists!")
    }
    return this.products.get(id.value)!
  }
  //#endregion

  //#region POS
  async insertPointOfSale(posID: EntityID, posModel: POSModel): Promise<void> {
    if (this.poss.has(posID.value)) {
      throw new Error("Already exists");
    }
    this.poss.set(posID.value, posModel);
  }

  async getPointOfSale(posID: EntityID): Promise<POSModel> {
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
  async insertOrder(orderID: EntityID, orderModel: OrderModel): Promise<void> {
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
        results.push(_.clone(model));
      }
    }
    return results;
  }
  //#endregion

  //#region  Users
  async insertUser(userID: EntityID, userModel: UserModel): Promise<void> {
    this.users.set(userID.value, userModel);
  }
  async getAllUsers(): Promise<readonly UserModel[]> { return Array.from(this.users.values()); }

  async getUser(userID: EntityID): Promise<UserModel> {
    if (!this.users.has(userID.value)) {
      throw new Error('User does not exist');
    }
    // todo: return clone! add test!
    return this.users.get(userID.value)!;
  }

  async findUserByIdName(idName: string): Promise<UserModel|undefined> {
    const maybeUser = _.find(Array.from(this.users.values()),
                             (u: UserModel) => { return u.userIdName == idName; });
    return maybeUser;
  }

  //#endregion
}

export {InMemoryStorage};