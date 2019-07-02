import Ingredient from "../../models/ingredients/ingredient";
import { InventoryActionTypes, INVENTORY_REQUEST_SUCCEEDED } from "./types";


const initialState: Array<Ingredient> = [];

export function inventoryReducer(
  state = initialState,
  action: InventoryActionTypes
): typeof initialState {
  switch (action.type) {
    case INVENTORY_REQUEST_SUCCEEDED:
      return action.payload;
    default:
      return state;
  }
}