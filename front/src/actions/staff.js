import axios from "axios";
import { getApi } from "../api";
import {
  STAFF_REQUEST_SUCCEEDED,
  STAFF_PATCH_EMPLOYEE,
  STAFF_PATCH_EMPLOYEE_ROLLBACK
} from "./types";

export const requestStaffSucceded = staff => {
  return { type: STAFF_REQUEST_SUCCEEDED, staff };
};

export const requestStaff = () => {
  return dispatch => {
    axios
      .get(`${getApi()}/staff`)
      .then(res => {
        dispatch(requestStaffSucceded(res.data));
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
    type: STAFF_PATCH_EMPLOYEE,
    payload: patchedEmployee,
    meta: {
      offline: {
        effect: {
          url: `${getApi()}/staff`,
          method: "PATCH",
          data: { patchedEmployee }
        },
        rollback: { type: STAFF_PATCH_EMPLOYEE_ROLLBACK, meta: employee }
      }
    }
  };
}
