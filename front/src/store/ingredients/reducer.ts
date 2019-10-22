import Ingredient from "../../models/ingredients/ingredient";
import {
  IngredientsActionTypes,
  INGREDIENTS_REQUEST_SUCCEEDED,
  INGREDIENTS_INSERT,
  INGREDIENTS_INSERT_ROLLBACK
} from "./types";
import { Reducer } from "redux";
import _ from "lodash";

const initialState: Array<Ingredient> = [];

export const ingredientsReducer: Reducer<
  Array<Ingredient>,
  IngredientsActionTypes
> = (state = initialState, action) => {
  switch (action.type) {
    case INGREDIENTS_REQUEST_SUCCEEDED:
      return action.ingredients;
    case INGREDIENTS_INSERT:
      return [...state, action.ingredient];
    case INGREDIENTS_INSERT_ROLLBACK:
      return _.without(state, action.ingredient);
    default:
      return state;
  }
};
