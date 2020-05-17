import { EntityID } from "../types/core_types";
import { POSModel, UserModel, OrderModel, ProductModel } from "../types/domain_types";

// Defines abstract storage interface.
interface AbstractStorage {
  insertProduct(productID: EntityID, productModel: ProductModel): Promise<void>;
  getProductByID(id: EntityID): Promise<ProductModel>;
  insertPointOfSale(posID: EntityID, posModel: POSModel): Promise<void>;
  getPointOfSale(posID: EntityID): Promise<POSModel>;
  getAllPointsOfSale(): Promise<void>;
  insertOrder(orderID: EntityID, rderModel: OrderModel): Promise<void>;
  getOrders(from: Date, to: Date): Promise<OrderModel[]>;
  insertUser(userID: EntityID, userModel: UserModel): Promise<void>;
  getUsers(): Promise<void>;
}

export { AbstractStorage };
