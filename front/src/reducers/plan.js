import moment from "moment";
import _ from "lodash";

import {
  PLAN_REQUEST_JOBS_SUCCEEDED,
  PLAN_SET_TIMESPAN,
  INSERT_JOB,
  INSERT_JOB_ROLLBACK,
  TECHMAPS_REQUEST_SUCCEEDED,
  EMPLOYEES_REQUEST_SUCCEEDED,
  EMPLOYEES_PUT,
  EMPLOYEES_PUT_ROLLBACK,
  DELETE_JOB,
  DELETE_JOB_ROLLBACK,
  JOB_PATCH,
  JOB_PATCH_ROLLBACK
} from "../actions/types";

const initialState = {
  fromDate: moment()
    .startOf("day")
    .valueOf(),
  toDate: moment()
    .endOf("day")
    .valueOf(),
  jobs: [],
  techMaps: [],
  employees: []
};

export default function plan(state = initialState, action) {
  switch (action.type) {
    case PLAN_SET_TIMESPAN: {
      return {
        ...state,
        fromDate: moment(action.timeSpan.fromDate).valueOf(),
        toDate: moment(action.timeSpan.toDate).valueOf()
      };
    }

    case PLAN_REQUEST_JOBS_SUCCEEDED: {
      return { ...state, jobs: action.jobs };
    }

    case INSERT_JOB: {
      return {
        ...state,
        jobs: [...state.jobs, action.payload]
      };
    }

    case INSERT_JOB_ROLLBACK: {
      return {
        ...state,
        jobs: state.jobs.filter(j => j.id !== action.meta.id)
      };
    }

    case DELETE_JOB:
      return {
        ...state,
        jobs: _.filter(state.jobs, j => j.id !== action.job.id)
      };

    case DELETE_JOB_ROLLBACK:
      return {
        ...state,
        jobs: [...state.jobs, action.job]
      };

    case TECHMAPS_REQUEST_SUCCEEDED:
      return {
        ...state,
        techMaps: action.techMaps
      };
      
    case EMPLOYEES_REQUEST_SUCCEEDED:
      return {
        ...state,
        employees: action.employees
      };

    case EMPLOYEES_PUT: {
      const fiilteredEmployees = state.employees.filter(
        e => e.id !== action.payload.id
      );

      return {
        ...state,
        employees: [...fiilteredEmployees, action.payload]
      };
    }

    case EMPLOYEES_PUT_ROLLBACK: {
      const fiilteredEmployees = state.employees.filter(
        e => e.id !== action.meta.id
      );

      return {
        ...state,
        employees: [...fiilteredEmployees, action.meta]
      };
    }

    case JOB_PATCH: {
      return {
        ...state,
        jobs: state.jobs.map(
          j => (j.id === action.payload.id ? action.payload : j)
        )
      };
    }

    case JOB_PATCH_ROLLBACK: {
      return {
        ...state,
        jobs: state.jobs.map(j => (j.id === action.meta.id ? action.meta : j))
      };
    }

    default:
      return state;
  }
}
