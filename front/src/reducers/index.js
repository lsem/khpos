import { combineReducers } from "redux";
import appState from "./appState";
import employees from "./employees";
import jobs from "./jobs";
import techMaps from "./techMaps";

export default combineReducers({
  appState,
  jobs,
  employees,
  techMaps
});
