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

export interface DayOrderItem {
  goodID: EID;
  ordered: number;
}

export enum DayStatus {
  "not_opened",
  "openned",
  "closed",
  "finalized"
}
export interface DayOrderModel {
  // keep a copy of goods for this day (todo: can be optimized? to store only references to some
  // goods snaphot?)
  items: ReadonlyArray<DayOrderItem>;
  status: DayStatus;
}

interface GoodModel {
  id: EID;
  name: string;
  units: string;
  available: boolean;
  removed: boolean;
}

export {POSModel, UserModel, OrderModel, OrderModelItem, GoodModel};
