import Device from "../../models/inventory/device";

export const INVENTORY_REQUEST_SUCCEEDED = "INVENTORY_REQUEST_SUCCEEDED";

interface InventoryRequestSucceededAction {
  type: typeof INVENTORY_REQUEST_SUCCEEDED
  payload: Array<Device>
}

export type InventoryActionTypes = InventoryRequestSucceededAction