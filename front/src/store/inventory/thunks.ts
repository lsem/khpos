import { getInventory } from "../../sampleData";
import { Dispatch } from "redux";
import { inventoryRequestSucceeded } from "./actions";

export const thunksRequestInventory = () => {
  return (dispatch: Dispatch) => {
    dispatch(inventoryRequestSucceeded(getInventory()))
  }
}