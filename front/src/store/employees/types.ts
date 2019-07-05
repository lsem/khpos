import Employee from "../../models/employees/employee";
import { Action } from "redux";

export const EMPLOYEES_REQUEST = "EMPLOYEES_REQUEST";
export const EMPLOYEES_REQUEST_SUCCEEDED = "EMPLOYEES_REQUEST_SUCCEEDED";
export const EMPLOYEES_PATCH_ROLLBACK = "EMPLOYEES_PATCH_ROLLBACK";
export const EMPLOYEES_PATCH = "EMPLOYEES_PATCH";

interface EmployeesRequestAction
  extends Action<typeof EMPLOYEES_REQUEST> {
}

interface EmployeesRequestSucceededAction
  extends Action<typeof EMPLOYEES_REQUEST_SUCCEEDED> {
  employees: Array<Employee>;
}

interface EmployeesPatchAction extends Action<typeof EMPLOYEES_PATCH> {
  employee: Employee;
}

interface EmployeesPatchRollbackAction
  extends Action<typeof EMPLOYEES_PATCH_ROLLBACK> {
  employee: Employee;
}

export type EmployeesActionTypes =
  EmployeesRequestAction  
  | EmployeesRequestSucceededAction
  | EmployeesPatchRollbackAction
  | EmployeesPatchAction;
