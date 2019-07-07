import Ingredient from "../../models/ingredients/ingredient";
import { InventoryActionTypes, INVENTORY_REQUEST_SUCCEEDED } from "./types";
import { Reducer } from "redux";

const initialState: Array<Ingredient> = [];

export const inventoryReducer: Reducer<
  Array<Ingredient>,
  InventoryActionTypes
> = (state = initialState, action) => {
  switch (action.type) {
    case INVENTORY_REQUEST_SUCCEEDED:
      return action.devices;
    default:
      return state;
  }
};
