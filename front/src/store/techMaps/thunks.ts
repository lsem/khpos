import { getTechMaps } from "../../sampleData";
import { Dispatch, ActionCreator } from "redux";
import { techMapsRequestSucceeded, techMapsRequest } from "./actions";
import { ThunkAction } from "redux-thunk";
import { TechMapsActionTypes } from "./types";
import { AppState } from "..";

export const thunkRequestTechMaps: ActionCreator<
  ThunkAction<
    Promise<TechMapsActionTypes>, // The type of function return
    AppState, // The type of global state
    null, // The type of the thunk parameter
    TechMapsActionTypes // The type of the last action to be dispatched
  >
> = () => {
  return async (dispatch: Dispatch) => {
    dispatch(techMapsRequest());

    const ingredients = await getTechMaps();

    return dispatch(techMapsRequestSucceeded(ingredients));
  };
};
