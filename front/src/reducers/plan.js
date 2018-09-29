import moment from "moment";
import _ from "lodash";

import {
  PLAN_REQUEST_JOBS_SUCCEEDED,
  PLAN_SET_TIMESPAN,
  MOVE_JOB,
  INSERT_JOB,
  SWAP_JOBS,
  INSERT_JOB_ROLLBACK,
  TECHMAPS_REQUEST_SUCCEEDED,
  STAFF_REQUEST_SUCCEEDED
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
        jobs: state.jobs.filter(j => j.id !== action.payload.id)
      }
    }
    //
    // SWAP_JOBS
    //
    case SWAP_JOBS: {
      const updatedJobs = [...state.jobs];
      const draggedJob = _.find(
        updatedJobs,
        j => j.id === action.payload.draggedJobId
      );
      console.assert(draggedJob);
      const neighbourJob = _.find(
        updatedJobs,
        j => j.id === action.payload.neighbourJobId
      );
      console.assert(neighbourJob);
      const t = neighbourJob.startTime;
      neighbourJob.startTime = draggedJob.startTime;
      draggedJob.startTime = t;
      return {
        ...state,
        jobs: updatedJobs
      };
    }
    
    //
    // TECHMAPS_REQUEST
    //
    case TECHMAPS_REQUEST_SUCCEEDED: return {
      ...state, 
      techMaps: action.techMaps
    }

    //
    // STAFF_REQUEST
    //
    case STAFF_REQUEST_SUCCEEDED: return {
      ...state,
      staff: action.staff
    }

    default:
      return state;
  }
}
