import axios from "axios";
import * as actionTypes from "../actions/types";
import { getApi } from "../api";
import { getTechMaps } from "../sampleData";

export const requestTechMaps = () => {
  return {
    type: actionTypes.TECHMAPS_REQUEST_SUCCEEDED,
    payload: getTechMaps()
  }
  // return dispatch => {
  //   axios
  //     .get(`${getApi()}/techmaps`)
  //     .then(res => {
  //       dispatch({
  //         type: actionTypes.TECHMAPS_REQUEST_SUCCEEDED,
  //         payload: res.data
  //       });
  //     })
  //     .catch(err => {
  //       console.log(err);
  //     });
  // };
};
