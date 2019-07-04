import Ingredient from "../../models/ingredients/ingredient";

export const INGREDIENTS_REQUEST_SUCCEEDED = "INGREDIENTS_REQUEST_SUCCEEDED";

interface IngredientsRequestSucceededAction {
  type: typeof INGREDIENTS_REQUEST_SUCCEEDED
  payload: Array<Ingredient>
}

export type IngredientsActionTypes = IngredientsRequestSucceededAction