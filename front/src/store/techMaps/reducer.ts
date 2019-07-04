import TechMap from "../../models/techMaps/techMap";
import { TechMapsActionTypes, TECHMAPS_REQUEST_SUCCEEDED } from "./types";


const initialState: Array<TechMap> = [];

export function techMapsReducer(
  state = initialState,
  action: TechMapsActionTypes
): typeof initialState {
  switch (action.type) {
    case TECHMAPS_REQUEST_SUCCEEDED:
      return action.payload;
    default:
      return state;
  }
}