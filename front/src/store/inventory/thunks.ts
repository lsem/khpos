import Device from "../../models/inventory/device";
import { ActionCreator, Dispatch } from "redux";
import { AppState } from "..";
import { getApi } from "../../api";
import { InventoryActionTypes } from "./types";
import {
  inventoryInsert,
  inventoryInsertRollback,
  inventoryRequest,
  inventoryRequestSucceeded
  } from "./actions";
import { ThunkAction } from "redux-thunk";

export const thunkRequestInventory: ActionCreator<
  ThunkAction<
    void, // The type of function return
    AppState, // The type of global state
    null, // The type of the thunk parameter
    InventoryActionTypes // The type of the last action to be dispatched
  >
> = () => {
  return async (dispatch: Dispatch) => {
    dispatch(inventoryRequest());

    fetch(`${getApi()}/inventory`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json;charset=UTF-8"
      }
    })
      .then(res => res.json())
      .then(data => {
        dispatch(inventoryRequestSucceeded(data as Array<Device>));
      })
      .catch(error => console.error(error));
  };
};

export const thunkInsertInventory: ActionCreator<
  ThunkAction<
    void, // The type of function return
    AppState, // The type of global state
    Device, // The type of the thunk parameter
    InventoryActionTypes // The type of the last action to be dispatched
  >
> = inventory => {
  return async dispatch => {
    dispatch({
      ...inventoryInsert(inventory),
      meta: {
        offline: {
          effect: {
            url: `${getApi()}/inventory`,
            method: "POST",
            body: JSON.stringify(inventory)
          },
          rollback: inventoryInsertRollback(inventory)
        }
      }
    });
  };
};
