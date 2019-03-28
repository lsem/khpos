import axios from "axios";
import * as actionTypes from "../actions/types";
import { getApi } from "../api";
import { getIngredients } from "../sampleData";

export const requestIngredients = () => {
  return {
    type: actionTypes.INGREDIENTS_REQUEST_SUCCEEDED,
    payload: getIngredients()
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
