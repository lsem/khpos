import * as actionTypes from "./types";
import TechMap from "../../models/techMaps/techMap";

export function techMapsRequestSucceeded(techMaps: Array<TechMap>): actionTypes.TechMapsActionTypes {
  return {
    type: actionTypes.TECHMAPS_REQUEST_SUCCEEDED,
    payload: techMaps
  }
}