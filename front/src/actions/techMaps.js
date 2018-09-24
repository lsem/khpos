import axios from "axios";
import { getApi } from "../api";
import { TECHMAPS_REQUEST_SUCCEEDED } from "./types";

export const requestTechMapsSucceded = techMaps => {
  return { type: TECHMAPS_REQUEST_SUCCEEDED, techMaps };
};

export const requestTechMaps = () => {
  return dispatch => {
    axios
      .get(`${getApi()}/techmaps`)
      .then(res => {
        dispatch(requestTechMapsSucceded(res.data));
      })
      .catch(err => {
        console.log(err);
      });
  };
};

