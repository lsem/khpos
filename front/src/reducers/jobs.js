import * as actionTypes from "../actions/types";

const initialState = [];

export default function jobsReducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.PLAN_REQUEST_JOBS_SUCCEEDED:
      return action.payload;

    case actionTypes.INSERT_JOB:
      return [...state, action.payload];

    case actionTypes.INSERT_JOB_ROLLBACK:
      return state.filter(j => j.id !== action.meta.id);

    case actionTypes.DELETE_JOB:
      return state.filter(j => j.id !== action.payload.id);

    case actionTypes.DELETE_JOB_ROLLBACK:
      return [...state, action.payload];

    case actionTypes.JOB_PATCH:
      return state.map(j => (j.id === action.payload.id ? action.payload : j));

    case actionTypes.JOB_PATCH_ROLLBACK:
      return state.map(j => (j.id === action.meta.id ? action.meta : j));

    default:
      return state;
  }
}
