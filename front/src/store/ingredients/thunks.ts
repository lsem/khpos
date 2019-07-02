import { getIngredients } from "../../sampleData";
import { Dispatch } from "redux";
import { ingredientsRequestSucceeded } from "./actions";

export const requestIngredients = () => {
  return (dispatch: Dispatch) => {
    dispatch(ingredientsRequestSucceeded(getIngredients()))
  }
}