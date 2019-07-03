import axios from "axios";
import { getApi } from "../../api";
import { Action, Dispatch } from "redux";
import { AppState } from "../index";
import { ThunkAction } from "redux-thunk";
import { employeesRequestSucceeded, employeesPatchRollback } from "./actions";
import Employee from "../../models/employees/employee";
import { EMPLOYEES_PATCH } from "./types";

export const thunkRequestEmployees = (): ThunkAction<
  void,
  AppState,
  null,
  Action<string>
> => async dispatch => {
  axios
    .get(`${getApi()}/employees`)
    .then(res => {
      dispatch(employeesRequestSucceeded(res.data as Array<Employee>));
    })
    .catch(err => {
      console.log(err);
    });
};

export function thunkPatchEmployee(patchedEmployee: Employee) {
  return async (dispatch: Dispatch, getState: Function) => {
    const state = getState() as AppState;

    const affectedEmployee = state.employees.find(
      e => e.id === patchedEmployee.id
    ) as Employee;

    dispatch({
      type: EMPLOYEES_PATCH,
      payload: patchedEmployee,
      meta: {
        offline: {
          effect: {
            url: `${getApi()}/employees/${patchedEmployee.id}`,
            method: "PUT",
            data: { ...patchedEmployee }
          },
          rollback: employeesPatchRollback(affectedEmployee)
        }
      }
    });
  };
}
