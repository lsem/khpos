import axios from "axios";
import { getApi } from "../api";
import {
  EMPLOYEES_REQUEST_SUCCEEDED,
  EMPLOYEES_PUT,
  EMPLOYEES_PUT_ROLLBACK
} from "./types";

export const requestEmployeesSucceded = employees => {
  return { type: EMPLOYEES_REQUEST_SUCCEEDED, employees };
};

export const requestEmployees = () => {
  return dispatch => {
    axios
      .get(`${getApi()}/employees`)
      .then(res => {
        dispatch(requestEmployeesSucceded(res.data));
      })
      .catch(err => {
        console.log(err);
      });
  };
};

export function patchEmployee(employee, patch) {
  const patchedEmployee = {
    ...employee,
    ...patch
  };
  return {
    type: EMPLOYEES_PUT,
    payload: patchedEmployee,
    meta: {
      offline: {
        effect: {
          url: `${getApi()}/employees/${employee.id}`,
          method: "PUT",
          data: { ...patchedEmployee }
        },
        rollback: { type: EMPLOYEES_PUT_ROLLBACK, meta: employee }
      }
    }
  };
}
