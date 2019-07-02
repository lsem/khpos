import { getTechMaps } from "../../sampleData";
import { Dispatch } from "redux";
import { techMapsRequestSucceeded } from "./actions";

export const requestTechMaps = () => {
  return (dispatch: Dispatch) => {
    dispatch(techMapsRequestSucceeded(getTechMaps()))
  }
}