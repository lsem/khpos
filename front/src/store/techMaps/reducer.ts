import TechMap from "../../models/techMaps/techMap";
import { TechMapsActionTypes, TECHMAPS_REQUEST_SUCCEEDED } from "./types";
import { Reducer } from "redux";


const initialState: Array<TechMap> = [];

export const techMapsReducer: Reducer<
Array<TechMap>,
TechMapsActionTypes
> = (state = initialState, action) => {
  switch (action.type) {
    case TECHMAPS_REQUEST_SUCCEEDED:
      return action.techMaps;
    default:
      return state;
  }
}