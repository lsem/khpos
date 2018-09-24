import moment from "moment";
import _ from "lodash";

import {
  PLAN_REQUEST_JOBS_SUCCEEDED,
  PLAN_SET_TIMESPAN,
  MOVE_JOB
} from "../actions/types";

const initialState = {
  fromDate: moment()
    .startOf("day")
    .valueOf(),
  toDate: moment()
    .endOf("day")
    .valueOf(),
  jobs: []
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
      const updatedJobs = [...state.jobs];
      const jobToMove = _.find(updatedJobs, j => j.id === action.payload.jobId);
      jobToMove.column = action.payload.column;
      jobToMove.startTime = moment(state.fromDate)
        .add(action.payload.timeMinutes, "minutes")
        .valueOf();
      return {
        ...state,
        jobs: updatedJobs
      };
    }

    default:
      return state;
  }
}
