import {EntityID} from "./core_types";
import { UserPermissions } from "./UserPermissions";

// Defines model for POS
interface POSModel {
  posID: EntityID;
  posIDName: string;
}

interface UserModel {
  userID: EntityID;
  userIdName: string;
  userFullName: string;
  telNumber: string;
  permissions: UserPermissions;
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

export {POSModel, UserModel, OrderModel, OrderModelItem, ProductModel};
