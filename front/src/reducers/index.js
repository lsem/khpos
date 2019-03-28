import { combineReducers } from "redux";
import appState from "./appState";
import employees from "./employees";
import jobs from "./jobs";
import techMaps from "./techMaps";
import ingredients from "./ingredients";
import inventory from "./inventory";

export default combineReducers({
  appState,
  jobs,
  employees,
  techMaps,
  ingredients,
  inventory
});
