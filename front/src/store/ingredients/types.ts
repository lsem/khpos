import Ingredient from "../../models/ingredients/ingredient";
import { Action } from "redux";

export const INGREDIENTS_REQUEST = "INGREDIENTS_REQUEST";
export const INGREDIENTS_REQUEST_SUCCEEDED = "INGREDIENTS_REQUEST_SUCCEEDED";
export const INGREDIENTS_INSERT = "INGREDIENTS_INSERT";
export const INGREDIENTS_INSERT_ROLLBACK = "INGREDIENTS_INSERT_ROLLBACK";

export interface IngredientsRequestAction
  extends Action<typeof INGREDIENTS_REQUEST> {}

export interface IngredientsRequestSucceededAction
  extends Action<typeof INGREDIENTS_REQUEST_SUCCEEDED> {
  ingredients: Array<Ingredient>;
}

export interface IngredientsInsertAction
  extends Action<typeof INGREDIENTS_INSERT> {
  ingredient: Ingredient;
}

export interface IngredientsInsertRollbackAction
  extends Action<typeof INGREDIENTS_INSERT_ROLLBACK> {
  ingredient: Ingredient;
}

export type IngredientsActionTypes =
  | IngredientsRequestAction
  | IngredientsRequestSucceededAction
  | IngredientsInsertAction
  | IngredientsInsertRollbackAction;
