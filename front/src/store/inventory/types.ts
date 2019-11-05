import Device from "../../models/inventory/device";
import { Action } from "redux";

export const INVENTORY_REQUEST = "INVENTORY_REQUEST";
export const INVENTORY_REQUEST_SUCCEEDED = "INVENTORY_REQUEST_SUCCEEDED";
export const INVENTORY_INSERT = "INVENTORY_INSERT";
export const INVENTORY_INSERT_ROLLBACK = "INVENTORY_INSERT_ROLLBACK";

interface InventoryRequestAction extends Action<typeof INVENTORY_REQUEST> {}

interface InventoryRequestSucceededAction
  extends Action<typeof INVENTORY_REQUEST_SUCCEEDED> {
  devices: Array<Device>;
}

export interface InventoryInsertAction extends Action<typeof INVENTORY_INSERT> {
  inventory: Device;
}

export interface InventoryInsertRollbackAction
  extends Action<typeof INVENTORY_INSERT_ROLLBACK> {
  inventory: Device;
}

export type InventoryActionTypes =
  | InventoryRequestSucceededAction
  | InventoryRequestAction
  | InventoryInsertAction
  | InventoryInsertRollbackAction;
