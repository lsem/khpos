import _ from 'lodash';
import Employee from '../../models/employees/employee';
import {
  EMPLOYEES_INSERT,
  EMPLOYEES_INSERT_ROLLBACK,
  EMPLOYEES_PATCH,
  EMPLOYEES_PATCH_ROLLBACK,
  EMPLOYEES_REQUEST_SUCCEEDED,
  EmployeesActionTypes
  } from './types';
import { Reducer } from 'redux';

const initialState: Array<Employee> = [];

export const employeesReducer: Reducer<
  Array<Employee>,
  EmployeesActionTypes
> = (state = initialState, action) => {
  switch (action.type) {
    case EMPLOYEES_REQUEST_SUCCEEDED:
      return action.employees;
    case EMPLOYEES_INSERT:
      return [...state, action.employee];
    case EMPLOYEES_INSERT_ROLLBACK:
      return _.without(state, action.employee);
    case EMPLOYEES_PATCH:
    case EMPLOYEES_PATCH_ROLLBACK:
      return state.map(e => {
        return e.id === action.employee.id ? action.employee : e;
      });
    default:
      return state;
  }
};
