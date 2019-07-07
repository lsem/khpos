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