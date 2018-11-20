import * as actionTypes from "../actions/types";

const initialState = [];

export default function employeesReducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.EMPLOYEES_REQUEST_SUCCEEDED: {
      return action.payload;
    }

    case actionTypes.EMPLOYEES_PUT: {
      const fiilteredEmployees = state.filter(
        e => e.id !== action.payload.id
      );

      return [...fiilteredEmployees, action.payload];
    }

    case actionTypes.EMPLOYEES_PUT_ROLLBACK: {
      const fiilteredEmployees = state.filter(
        e => e.id !== action.meta.id
      );

      return [...fiilteredEmployees, action.meta];
    }

    default:
      return state;
  }
}
