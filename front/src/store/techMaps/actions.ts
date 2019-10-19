import * as actionTypes from "./types";
import TechMap from "../../models/techMaps/techMap";

export function techMapsRequest(): actionTypes.TechMapsActionTypes {
  return {
    type: actionTypes.TECHMAPS_REQUEST
  };
}

export function techMapsRequestSucceeded(
  techMaps: Array<TechMap>
): actionTypes.TechMapsActionTypes {
  return {
    type: actionTypes.TECHMAPS_REQUEST_SUCCEEDED,
    techMaps: techMaps
  };
}

export function techMapsInsert(
  techMap: TechMap
): actionTypes.TechMapsActionTypes {
  return {
    type: actionTypes.TECHMAPS_INSERT,
    techMap
  };
}

export function techMapsInsertRollback(
  techMap: TechMap
): actionTypes.TechMapsActionTypes {
  return {
    type: actionTypes.TECHMAPS_INSERT_ROLLBACK,
    techMap
  };
}

export function techMapsPut(
  techMap: TechMap
): actionTypes.TechMapsActionTypes {
  return {
    type: actionTypes.TECHMAPS_PUT,
    techMap
  };
}

export function techMapsPutRollback(
  originalTechMap: TechMap
): actionTypes.TechMapsActionTypes {
  return {
    type: actionTypes.TECHMAPS_PUT,
    techMap: originalTechMap
  };
}
