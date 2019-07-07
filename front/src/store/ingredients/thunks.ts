import { getIngredients } from "../../sampleData";
import { Dispatch, ActionCreator } from "redux";
import { ingredientsRequestSucceeded, ingredientsRequest } from "./actions";
import { ThunkAction } from "redux-thunk";
import { IngredientsActionTypes } from "./types";
import { AppState } from "@redux-offline/redux-offline/lib/types";

export const thunkRequestIngredients: ActionCreator<
  ThunkAction<
    Promise<IngredientsActionTypes>, // The type of function return
    AppState, // The type of global state
    null, // The type of the thunk parameter
    IngredientsActionTypes // The type of the last action to be dispatched
  >
> = () => {
  return async (dispatch: Dispatch) => {
    dispatch(ingredientsRequest());

    const ingredients = await getIngredients();

    return dispatch(ingredientsRequestSucceeded(ingredients));
  };
};
