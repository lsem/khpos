import Employee from "../../models/employees/employee";
import {
  EmployeesActionTypes,
  EMPLOYEES_REQUEST_SUCCEEDED,
  EMPLOYEES_PATCH,
  EMPLOYEES_PATCH_ROLLBACK
} from "./types";
import { Reducer } from "redux";

const initialState: Array<Employee> = [];

export const employeesReducer: Reducer<
  Array<Employee>,
  EmployeesActionTypes
> = (state = initialState, action) => {
  switch (action.type) {
    case EMPLOYEES_REQUEST_SUCCEEDED:
      return action.employees;
    case EMPLOYEES_PATCH:
    case EMPLOYEES_PATCH_ROLLBACK:
      return state.map(e => {
        return e.id === action.employee.id ? action.employee : e;
      });
    default:
      return state;
  }
};
