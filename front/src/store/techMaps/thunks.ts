import { getTechMaps } from "../../sampleData";
import { Dispatch } from "redux";
import { techMapsRequestSucceeded } from "./actions";

export const thunkRequestTechMaps = () => {
  return (dispatch: Dispatch) => {
    dispatch(techMapsRequestSucceeded(getTechMaps()))
  }
}