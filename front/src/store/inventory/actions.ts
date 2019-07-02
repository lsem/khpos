import * as actionTypes from "./types";
import Device from "../../models/inventory/device";

export function inventoryRequestSucceeded(inventory: Array<Device>): actionTypes.InventoryActionTypes {
  return {
    type: actionTypes.INVENTORY_REQUEST_SUCCEEDED,
    payload: inventory
  }
}