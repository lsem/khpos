import TechMap from "../../models/techMaps/techMap";
import { Action } from "redux";

export const TECHMAPS_REQUEST = "TECHMAPS_REQUEST";
export const TECHMAPS_REQUEST_SUCCEEDED = "TECHMAPS_REQUEST_SUCCEEDED";
export const TECHMAPS_INSERT = "TECHMAPS_INSERT";
export const TECHMAPS_INSERT_ROLLBACK = "TECHMAPS_INSERT_ROLLBACK";
export const TECHMAPS_PUT = "TECHMAPS_PUT";
export const TECHMAPS_PUT_ROLLBACK = "TECHMAPS_PUT_ROLLBACK";

interface TechMapsRequestAction extends Action<typeof TECHMAPS_REQUEST> {
}

interface TechMapsRequestSucceededAction extends Action<typeof TECHMAPS_REQUEST_SUCCEEDED> {
  techMaps: Array<TechMap>
}

interface TechMapsInsertAction extends Action<typeof TECHMAPS_INSERT> {
  techMap: TechMap
}

interface TechMapsInsertRollbackAction extends Action<typeof TECHMAPS_INSERT_ROLLBACK> {
  techMap: TechMap
}

interface TechMapsPutAction extends Action<typeof TECHMAPS_PUT> {
  techMap: TechMap
}

interface TechMapsPutRollbackAction extends Action<typeof TECHMAPS_PUT_ROLLBACK> {
  techMap: TechMap
}

export type TechMapsActionTypes = 
TechMapsRequestAction
| TechMapsRequestSucceededAction
| TechMapsInsertAction
| TechMapsInsertRollbackAction
| TechMapsPutAction
| TechMapsPutRollbackAction