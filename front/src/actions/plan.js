import moment from "moment";
import axios from "axios";
import { getApi } from "../api";
import { PLAN_REQUEST_JOBS_SUCCEEDED, PLAN_SET_TIMESPAN } from "./types";

export const requestJobsSucceded = jobs => { return { type: PLAN_REQUEST_JOBS_SUCCEEDED, jobs } };
export const setTimeSpan = (fromDate, toDate) => 
  { return { type: PLAN_SET_TIMESPAN, timeSpan: { fromDate, toDate } } };

export const requestJobs = (fromDate, toDate) => {
    return dispatch => {
        axios.get(`${ getApi() }/plan`, {
          params: { fromDate: moment(fromDate).toISOString(), toDate: moment(toDate).toISOString() }
        })
        .then(res => {
          dispatch(setTimeSpan(fromDate, toDate));
          dispatch(requestJobsSucceded(res.data));
        })
        .catch(err => {
          console.log(err);
        });
    }
}
