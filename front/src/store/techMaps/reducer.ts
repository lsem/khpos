import TechMap from "../../models/techMaps/techMap";
import {
  TechMapsActionTypes,
  TECHMAPS_REQUEST_SUCCEEDED,
  TECHMAPS_PUT,
  TECHMAPS_PUT_ROLLBACK,
  TECHMAPS_INSERT,
  TECHMAPS_INSERT_ROLLBACK
} from "./types";
import { Reducer } from "redux";
import _ from "lodash";

const initialState: Array<TechMap> = [];

export const techMapsReducer: Reducer<Array<TechMap>, TechMapsActionTypes> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case TECHMAPS_REQUEST_SUCCEEDED:
      return action.techMaps;
    case TECHMAPS_INSERT:
      return [...state, action.techMap];
    case TECHMAPS_INSERT_ROLLBACK:
      return _.without(state, action.techMap);
    case TECHMAPS_PUT:
    case TECHMAPS_PUT_ROLLBACK:
      return state.map(t => t.id === action.techMap.id ? action.techMap : t)
    default:
      return state;
  }
};
