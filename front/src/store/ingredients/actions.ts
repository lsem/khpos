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
    ingredients
  };
}

export function ingredientsInsert(
  ingredient: Ingredient
): actionTypes.IngredientsActionTypes {
  return {
    type: actionTypes.INGREDIENTS_INSERT,
    ingredient
  };
}

export function ingredientsInsertRollback(
  ingredient: Ingredient
): actionTypes.IngredientsActionTypes {
  return {
    type: actionTypes.INGREDIENTS_INSERT_ROLLBACK,
    ingredient
  };
}
