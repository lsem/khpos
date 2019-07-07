import TechMap from "../../models/techMaps/techMap";
import { Action } from "redux";

export const TECHMAPS_REQUEST = "TECHMAPS_REQUEST";
export const TECHMAPS_REQUEST_SUCCEEDED = "TECHMAPS_REQUEST_SUCCEEDED";

interface TechMapsRequestAction extends Action<typeof TECHMAPS_REQUEST> {
}

interface TechMapsRequestSucceededAction extends Action<typeof TECHMAPS_REQUEST_SUCCEEDED> {
  techMaps: Array<TechMap>
}

export type TechMapsActionTypes = 
TechMapsRequestAction
| TechMapsRequestSucceededAction