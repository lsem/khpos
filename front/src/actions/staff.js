import axios from "axios";
import { getApi } from "../api";
import { STAFF_REQUEST_SUCCEEDED } from "./types";

export const requestStaffSucceded = staff => { return { type: STAFF_REQUEST_SUCCEEDED, staff } };

export const requestStaff = () => {
  return dispatch => {
      axios.get(`${ getApi() }/staff`)
      .then(res => {
        dispatch(requestStaffSucceded(res.data));
      })
      .catch(err => {
        console.log(err);
      });
  }
}