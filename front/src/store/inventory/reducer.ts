import _ from "lodash";
import Ingredient from "../../models/ingredients/ingredient";
import {
  INVENTORY_INSERT,
  INVENTORY_INSERT_ROLLBACK,
  INVENTORY_REQUEST_SUCCEEDED,
  InventoryActionTypes
  } from "./types";
import { Reducer } from "redux";

const initialState: Array<Ingredient> = [];

export const inventoryReducer: Reducer<
  Array<Ingredient>,
  InventoryActionTypes
> = (state = initialState, action) => {
  switch (action.type) {
    case INVENTORY_REQUEST_SUCCEEDED:
      return action.devices;
    case INVENTORY_INSERT:
      return [...state, action.inventory];
    case INVENTORY_INSERT_ROLLBACK:
      return _.without(state, action.inventory);
    default:
      return state;
  }
};
