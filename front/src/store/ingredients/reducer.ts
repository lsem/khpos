import Ingredient from "../../models/ingredients/ingredient";
import {
  IngredientsActionTypes,
  INGREDIENTS_REQUEST_SUCCEEDED
} from "./types";
import { Reducer } from "redux";

const initialState: Array<Ingredient> = [];

export const ingredientsReducer: Reducer<
  Array<Ingredient>,
  IngredientsActionTypes
> = (state = initialState, action) => {
  switch (action.type) {
    case INGREDIENTS_REQUEST_SUCCEEDED:
      return action.ingredients;
    default:
      return state;
  }
};
