import moment from "moment";
import * as actionTypes from "../actions/types";

const initialState = {
  planTimeSpan: {
    fromDate: moment().startOf("day").valueOf(),
    toDate: moment().endOf("day").valueOf()
  }
};

export default function appStateReducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.PLAN_SET_TIMESPAN: {
      return {
        ...state,
        planTimeSpan: {
          fromDate: moment(action.payload.fromDate).valueOf(),
          toDate: moment(action.payload.toDate).valueOf()
        }
      };
    }

    default: return state
  }
}