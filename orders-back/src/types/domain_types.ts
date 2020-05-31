import {EID} from "./core_types";
import {UserPermissions} from "./UserPermissions";

// Defines model for POS
interface POSModel {
  posID: EID;
  posIDName: string;
}

interface UserModel {
  userID: EID;
  userIdName: string;
  userFullName: string;
  telNumber: string;
  permissions: UserPermissions;
}

interface OrderModelItem {
  id: EID; // can be product, ingridient, etc..
  count: number;
}

interface OrderModel {
  whoPlaced: EID;
  toDate: Date;
  posID: EID;
  items: OrderModelItem[];
}

interface GoodModel {
  id: EID;
  name: string;
  units: string;
  available: boolean;
  removed: boolean;
}

export {POSModel, UserModel, OrderModel, OrderModelItem, GoodModel};
