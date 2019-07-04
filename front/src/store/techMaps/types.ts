import TechMap from "../../models/techMaps/techMap";

export const TECHMAPS_REQUEST_SUCCEEDED = "TECHMAPS_REQUEST_SUCCEEDED";

interface TechMapsRequestSucceededAction {
  type: typeof TECHMAPS_REQUEST_SUCCEEDED
  payload: Array<TechMap>
}

export type TechMapsActionTypes = TechMapsRequestSucceededAction