import axios from "axios";
import * as actionTypes from "../actions/types";
import { getApi } from "../api";

export const requestEmployees = () => {
  return dispatch => {
    axios
      .get(`${getApi()}/employees`)
      .then(res => {
        dispatch({
          type: actionTypes.EMPLOYEES_REQUEST_SUCCEEDED,
          payload: res.data
        });
      })
      .catch(err => {
        console.log(err);
      });
  };
};

export function patchEmployee(id, patch) {
  return (dispatch, getState) => {
    const state = getState();

    const affectedEmployee = state.employees.find(e => e.id === id);
    const patchedEmployee = {
      ...affectedEmployee,
      ...patch
    };

    dispatch({
      type: actionTypes.EMPLOYEES_PUT,
      payload: patchedEmployee,
      meta: {
        offline: {
          effect: {
            url: `${getApi()}/employees/${id}`,
            method: "PUT",
            data: { ...patchedEmployee }
          },
          rollback: {
            type: actionTypes.EMPLOYEES_PUT_ROLLBACK,
            meta: affectedEmployee
          }
        }
      }
    });
  };
}
