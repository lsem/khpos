import moment from "moment";

import { SET_JOBS, SET_TIMESPAN } from "../actions/types";

const initialState = {
  fromDate: moment().startOf('day').valueOf(),
  toDate: moment().endOf('day').valueOf(),
  jobs: []
};

export default function plan(state = initialState, action) {
  switch (action.type) {
    case SET_TIMESPAN: return { 
      ...state, 
      fromDate: moment(action.timeSpan.fromDate).valueOf(), 
      toDate: moment(action.timeSpan.toDate).valueOf() 
    };
    case SET_JOBS: return { ...state, jobs: action.jobs };
    default:
      return state
  }
}