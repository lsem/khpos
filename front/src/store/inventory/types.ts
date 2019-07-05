import Device from "../../models/inventory/device";
import { Action } from "redux";

export const INVENTORY_REQUEST = "INVENTORY_REQUEST";
export const INVENTORY_REQUEST_SUCCEEDED = "INVENTORY_REQUEST_SUCCEEDED";

interface InventoryRequestAction extends Action<typeof INVENTORY_REQUEST> {
}

interface InventoryRequestSucceededAction extends Action<typeof INVENTORY_REQUEST_SUCCEEDED> {
  devices: Array<Device>
}

export type InventoryActionTypes = 
InventoryRequestSucceededAction
| InventoryRequestAction