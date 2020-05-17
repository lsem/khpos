import { EntityID } from "./core_types";

// Defines model for POS
interface POSModel {
  posIDName: string;
}

interface UserModel {
  userIdName: string;
  userFullName: string;
}

interface OrderModelItem {
  id: EntityID; // can be product, ingridient, etc..
  count: number;
}

interface OrderModel {
  whoPlaced: EntityID;
  toDate: Date;
  posID: EntityID;
  items: OrderModelItem[];
}

interface ProductModel {
  id: EntityID;
  productName: string;
}

export { POSModel, UserModel, OrderModel, OrderModelItem, ProductModel };
