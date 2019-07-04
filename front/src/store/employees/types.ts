import Employee from "../../models/employees/employee";

export const EMPLOYEES_REQUEST_SUCCEEDED = "EMPLOYEES_REQUEST_SUCCEEDED";
export const EMPLOYEES_PATCH_ROLLBACK = "EMPLOYEES_PATCH_ROLLBACK";
export const EMPLOYEES_PATCH = "EMPLOYEES_PATCH";

interface EmployeesRequestSucceededAction {
  type: typeof EMPLOYEES_REQUEST_SUCCEEDED
  payload: Array<Employee>
}

interface EmployeesPatchAction {
  type: typeof EMPLOYEES_PATCH
  payload: Employee
}

interface EmployeesPatchRollbackAction {
  type: typeof EMPLOYEES_PATCH_ROLLBACK
  payload: Employee
}

export type EmployeesActionTypes = EmployeesRequestSucceededAction 
  | EmployeesPatchRollbackAction
  | EmployeesPatchAction