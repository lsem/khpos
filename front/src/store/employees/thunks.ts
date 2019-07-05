import axios from "axios";
import { getApi } from "../../api";
import { ActionCreator } from "redux";
import { AppState } from "../index";
import { ThunkAction } from "redux-thunk";
import {
  employeesRequestSucceeded,
  employeesPatch,
  employeesPatchRollback,
  employeesRequest
} from "./actions";
import Employee from "../../models/employees/employee";
import { EmployeesActionTypes } from "./types";

export const thunkRequestEmployees: ActionCreator<
  ThunkAction<
    Promise<void>, // The type of function return
    AppState, // The type of global state
    null, // The type of the thunk parameter
    EmployeesActionTypes // The type of the last action to be dispatched
  >
> = () => {
  return async dispatch => {
    dispatch(employeesRequest());
    axios
      .get(`${getApi()}/employees`)
      .then(res => {
        dispatch(employeesRequestSucceeded(res.data as Array<Employee>));
      })
      .catch(err => {
        console.log(err);
      });
  };
};

export const thunkPatchEmployee: ActionCreator<
  ThunkAction<
    Promise<void>, // The type of function return
    AppState, // The type of global state
    null, // The type of the thunk parameter
    EmployeesActionTypes // The type of the last action to be dispatched
  >
> = (patchedEmployee: Employee) => {
  return async (dispatch, getState) => {
    const state = getState() as AppState;

    const affectedEmployee = state.employees.find(
      e => e.id === patchedEmployee.id
    ) as Employee;

    dispatch({
      ...employeesPatch(patchedEmployee),
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
};
