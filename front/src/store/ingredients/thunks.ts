import { Dispatch, ActionCreator } from "redux";
import { ingredientsRequestSucceeded, ingredientsRequest, ingredientsInsert, ingredientsInsertRollback } from "./actions";
import { ThunkAction } from "redux-thunk";
import { IngredientsActionTypes } from "./types";
import { AppState } from "@redux-offline/redux-offline/lib/types";
import { getApi } from "../../api";
import Ingredient from "../../models/ingredients/ingredient";

export const thunkRequestIngredients: ActionCreator<
  ThunkAction<
    void, // The type of function return
    AppState, // The type of global state
    null, // The type of the thunk parameter
    IngredientsActionTypes // The type of the last action to be dispatched
  >
> = () => {
  return async (dispatch: Dispatch) => {
    dispatch(ingredientsRequest());

    fetch(`${getApi()}/ingredients`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json;charset=UTF-8"
      }
    })
      .then(res => res.json())
      .then(data => {
        dispatch(ingredientsRequestSucceeded(data as Array<Ingredient>));
      })
      .catch(error => console.error(error));
  };
};

export const thunkInsertIngredient: ActionCreator<
  ThunkAction<
    void, // The type of function return
    AppState, // The type of global state
    Ingredient, // The type of the thunk parameter
    IngredientsActionTypes // The type of the last action to be dispatched
  >
> = ingredient => {
  return async dispatch => {
    dispatch({
      ...ingredientsInsert(ingredient),
      meta: {
        offline: {
          effect: {
            url: `${getApi()}/ingredients`,
            method: "POST",
            body: JSON.stringify(ingredient)
          },
          rollback: ingredientsInsertRollback(ingredient)
        }
      }
    });
  };
};
