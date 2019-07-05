import Ingredient from "../../models/ingredients/ingredient";
import { Action } from "redux";

export const INGREDIENTS_REQUEST = "INGREDIENTS_REQUEST";
export const INGREDIENTS_REQUEST_SUCCEEDED = "INGREDIENTS_REQUEST_SUCCEEDED";

export interface IngredientsRequestAction extends Action<typeof INGREDIENTS_REQUEST> {
}

export interface IngredientsRequestSucceededAction
  extends Action<typeof INGREDIENTS_REQUEST_SUCCEEDED> {
  ingredients: Array<Ingredient>;
}

export type IngredientsActionTypes =
  | IngredientsRequestAction
  | IngredientsRequestSucceededAction;
