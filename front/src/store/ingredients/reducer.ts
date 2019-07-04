import Ingredient from "../../models/ingredients/ingredient";
import { IngredientsActionTypes, INGREDIENTS_REQUEST_SUCCEEDED } from "./types";


const initialState: Array<Ingredient> = [];

export function ingredientsReducer(
  state = initialState,
  action: IngredientsActionTypes
): typeof initialState {
  switch (action.type) {
    case INGREDIENTS_REQUEST_SUCCEEDED:
      return action.payload;
    default:
      return state;
  }
}