import * as actionTypes from "./types";
import Ingredient from "../../models/ingredients/ingredient";

export function ingredientsRequest(): actionTypes.IngredientsActionTypes {
  return {
    type: actionTypes.INGREDIENTS_REQUEST
  };
}

export function ingredientsRequestSucceeded(
  ingredients: Array<Ingredient>
): actionTypes.IngredientsActionTypes {
  return {
    type: actionTypes.INGREDIENTS_REQUEST_SUCCEEDED,
    ingredients: ingredients
  };
}
