import moment from "moment";

import { PLAN_REQUEST_JOBS_SUCCEEDED, PLAN_SET_TIMESPAN } from "../actions/types";

const initialState = {
  fromDate: moment().startOf('day').valueOf(),
  toDate: moment().endOf('day').valueOf(),
  jobs: []
};

export default function plan(state = initialState, action) {
  switch (action.type) {
    case PLAN_SET_TIMESPAN: return { 
      ...state, 
      fromDate: moment(action.timeSpan.fromDate).valueOf(), 
      toDate: moment(action.timeSpan.toDate).valueOf() 
    };
    case PLAN_REQUEST_JOBS_SUCCEEDED: return { ...state, jobs: action.jobs };
    default:
      return state
  }
}