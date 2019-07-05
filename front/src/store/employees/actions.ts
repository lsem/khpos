import * as actionTypes from "./types";
import Employee from "../../models/employees/employee";

export function employeesRequest(): actionTypes.EmployeesActionTypes {
  return {
    type: actionTypes.EMPLOYEES_REQUEST
  };
}

export function employeesRequestSucceeded(
  employees: Array<Employee>
): actionTypes.EmployeesActionTypes {
  return {
    type: actionTypes.EMPLOYEES_REQUEST_SUCCEEDED,
    employees: employees
  };
}

export function employeesPatch(
  patchedEmployee: Employee
): actionTypes.EmployeesActionTypes {
  return {
    type: actionTypes.EMPLOYEES_PATCH,
    employee: patchedEmployee
  };
}

export function employeesPatchRollback(
  affectedEmployee: Employee
): actionTypes.EmployeesActionTypes {
  return {
    type: actionTypes.EMPLOYEES_PATCH_ROLLBACK,
    employee: affectedEmployee
  };
}
