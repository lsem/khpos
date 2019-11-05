import * as actionTypes from "./types";
import Device from "../../models/inventory/device";

export function inventoryRequest(): actionTypes.InventoryActionTypes {
  return {
    type: actionTypes.INVENTORY_REQUEST
  };
}

export function inventoryRequestSucceeded(
  devices: Array<Device>
): actionTypes.InventoryActionTypes {
  return {
    type: actionTypes.INVENTORY_REQUEST_SUCCEEDED,
    devices: devices
  };
}

export function inventoryInsert(
  inventory: Device
): actionTypes.InventoryActionTypes {
  return {
    type: actionTypes.INVENTORY_INSERT,
    inventory
  };
}

export function inventoryInsertRollback(
  inventory: Device
): actionTypes.InventoryActionTypes {
  return {
    type: actionTypes.INVENTORY_INSERT_ROLLBACK,
    inventory
  };
}