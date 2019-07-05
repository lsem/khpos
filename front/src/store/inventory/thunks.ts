import { getInventory } from "../../sampleData";
import { Dispatch, ActionCreator } from "redux";
import { inventoryRequestSucceeded, inventoryRequest } from "./actions";
import { ThunkAction } from "redux-thunk";
import { InventoryActionTypes } from "./types";
import { AppState } from "..";

export const thunkRequestInventory: ActionCreator<
  ThunkAction<
    Promise<InventoryActionTypes>, // The type of function return
    AppState, // The type of global state
    null, // The type of the thunk parameter
    InventoryActionTypes // The type of the last action to be dispatched
  >
> = () => {
  return async (dispatch: Dispatch) => {
    dispatch(inventoryRequest());

    const devices = await getInventory();

    return dispatch(inventoryRequestSucceeded(devices));
  };
};