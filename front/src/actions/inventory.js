import axios from "axios";
import * as actionTypes from "../actions/types";
import { getApi } from "../api";
import { getInventory } from "../sampleData";

export const requestInventory = () => {
  return {
    type: actionTypes.INVENTORY_REQUEST_SUCCEEDED,
    payload: getInventory()
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
