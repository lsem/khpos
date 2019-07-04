import { getInventory } from "../../sampleData";
import { Dispatch } from "redux";
import { inventoryRequestSucceeded } from "./actions";

export const thunkRequestInventory = () => {
  return (dispatch: Dispatch) => {
    dispatch(inventoryRequestSucceeded(getInventory()))
  }
}