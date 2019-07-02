import {
  PlanActionTypes,
  PLAN_REQUEST_JOBS_SUCCEEDED,
  PLAN_SET_TIMESPAN
} from "./types";
import Job from "../../models/plan/job";
import moment from "moment";
import TimeSpan from "../../models/plan/timeSpan";

const initialState = {
  jobs: [] as Array<Job>,
  timeSpan: {
    fromDate: moment()
      .startOf("day")
      .toDate(),
    toDate: moment()
      .endOf("day")
      .toDate()
  } as TimeSpan
};

export function planReducer(
  state = initialState,
  action: PlanActionTypes
): typeof initialState {
  switch (action.type) {
    case PLAN_SET_TIMESPAN:
      return { ...state, timeSpan: action.payload };
    case PLAN_REQUEST_JOBS_SUCCEEDED:
      return { ...state, jobs: action.payload };
    default:
      return state;
  }
}
