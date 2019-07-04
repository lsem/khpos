import * as actionTypes from "./types";
import Employee from "../../models/employees/employee";

export function employeesRequestSucceeded(employees: Array<Employee>): actionTypes.EmployeesActionTypes {
  return {
    type: actionTypes.EMPLOYEES_REQUEST_SUCCEEDED,
    payload: employees
  }
}

export function employeesPatch(patchedEmployee: Employee): actionTypes.EmployeesActionTypes {
  return {
    type: actionTypes.EMPLOYEES_PATCH_ROLLBACK,
    payload: patchedEmployee
  }
}

export function employeesPatchRollback(affectedEmployee: Employee): actionTypes.EmployeesActionTypes {
  return {
    type: actionTypes.EMPLOYEES_PATCH_ROLLBACK,
    payload: affectedEmployee
  }
}