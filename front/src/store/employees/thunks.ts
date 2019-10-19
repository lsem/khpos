import axios from 'axios';
import Employee from '../../models/employees/employee';
import { ActionCreator } from 'redux';
import { AppState } from '../index';
import { EmployeesActionTypes } from './types';
import {
  employeesInsert,
  employeesInsertRollback,
  employeesPatch,
  employeesPatchRollback,
  employeesRequest,
  employeesRequestSucceeded
  } from './actions';
import { getApi } from '../../api';
import { ThunkAction } from 'redux-thunk';

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

export const thunkInsertEmployee: ActionCreator<
  ThunkAction<
    Promise<void>, // The type of function return
    AppState, // The type of global state
    null, // The type of the thunk parameter
    EmployeesActionTypes // The type of the last action to be dispatched
  >
> = (employee: Employee) => {
  return async (dispatch) => {
    dispatch({
      ...employeesInsert(employee),
      meta: {
        offline: {
          effect: {
            url: `${getApi()}/employees`,
            method: "POST",
            json: { ...employee }
          },
          rollback: employeesInsertRollback(employee)
        }
      }
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
            json: { ...patchedEmployee }
          },
          rollback: employeesPatchRollback(affectedEmployee)
        }
      }
    });
  };
};
