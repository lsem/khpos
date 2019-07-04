import Employee from "../../models/employees/employee";
import {
  EmployeesActionTypes,
  EMPLOYEES_REQUEST_SUCCEEDED,
  EMPLOYEES_PATCH,
  EMPLOYEES_PATCH_ROLLBACK
} from "./types";

const initialState: Array<Employee> = [];

export function employeesReducer(
  state = initialState,
  action: EmployeesActionTypes
): typeof initialState {
  switch (action.type) {
    case EMPLOYEES_REQUEST_SUCCEEDED:
      return action.payload;
    case EMPLOYEES_PATCH:
    case EMPLOYEES_PATCH_ROLLBACK:
      return state.map(e => {
        return e.id === action.payload.id ? action.payload : e;
      });
    default:
      return state;
  }
}
