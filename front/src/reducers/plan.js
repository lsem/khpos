import moment from "moment";
import _ from "lodash";

import {
  PLAN_REQUEST_JOBS_SUCCEEDED,
  PLAN_SET_TIMESPAN,
  MOVE_JOB,
  MOVE_JOB_ROLLBACK,
  INSERT_JOB,
  INSERT_JOB_ROLLBACK,
  TECHMAPS_REQUEST_SUCCEEDED,
  STAFF_REQUEST_SUCCEEDED,
  STAFF_PATCH_EMPLOYEE,
  STAFF_PATCH_EMPLOYEE_ROLLBACK,
  DELETE_JOB,
  DELETE_JOB_ROLLBACK
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
  staff: []
};

export default function plan(state = initialState, action) {
  switch (action.type) {
    //
    // PLAN_SET_TIMESPAN
    //
    case PLAN_SET_TIMESPAN: {
      return {
        ...state,
        fromDate: moment(action.timeSpan.fromDate).valueOf(),
        toDate: moment(action.timeSpan.toDate).valueOf()
      };
    }
    //
    // PLAN_REQUEST_JOBS_SUCCEEDED
    //
    case PLAN_REQUEST_JOBS_SUCCEEDED: {
      return { ...state, jobs: action.jobs };
    }
    //
    // MOVE_JOB
    //
    case MOVE_JOB: {
      const jobToMove = {
        ...action.payload.job,
        column: action.payload.column,
        startTime: action.payload.startTime
      };

      const filtered = _.filter(
        state.jobs,
        j => j.id !== action.payload.job.id
      );

      const newJobs = [...filtered, jobToMove];

      return {
        ...state,
        jobs: newJobs
      };
    }

    case MOVE_JOB_ROLLBACK: {
      const filtered = _.filter(state.jobs, j => j.id !== action.meta.job.id);

      const newJobs = [...filtered, action.meta.job];

      return {
        ...state,
        jobs: newJobs
      };
    }
    //
    // INSERT_JOB
    //
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

    //
    // DELETE_JOB
    //
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

    //
    // TECHMAPS_REQUEST
    //
    case TECHMAPS_REQUEST_SUCCEEDED:
      return {
        ...state,
        techMaps: action.techMaps
      };

    //
    // STAFF_REQUEST
    //
    case STAFF_REQUEST_SUCCEEDED:
      return {
        ...state,
        staff: action.staff
      };

    case STAFF_PATCH_EMPLOYEE: {
      const fiilteredEmployees = state.staff.filter(
        e => e.id !== action.payload.id
      );

      return {
        ...state,
        staff: [...fiilteredEmployees, action.payload]
      };
    }

    case STAFF_PATCH_EMPLOYEE_ROLLBACK: {
      const fiilteredEmployees = state.staff.filter(
        e => e.id !== action.meta.id
      );

      return {
        ...state,
        staff: [...fiilteredEmployees, action.meta]
      };
    }

    default:
      return state;
  }
}
