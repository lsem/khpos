import moment from "moment";
import axios from "axios";
import { getApi } from "../api";
import { SET_JOBS, SET_TIMESPAN } from "./types";

export const setJobs = jobs => { return { type: SET_JOBS, jobs } };
export const setTimeSpan = (fromDate, toDate) => 
  { return { type: SET_TIMESPAN, timeSpan: { fromDate, toDate } } };

export const getJobs = (fromDate, toDate) => {
    return dispatch => {
        axios.get(`${ getApi() }/plan`, {
          params: { fromDate: moment(fromDate).toISOString(), toDate: moment(toDate).toISOString() }
        })
        .then(res => {
          dispatch(setTimeSpan(fromDate, toDate));
          dispatch(setJobs(res.data));
        })
        .catch(err => {
          console.log(err);
        });
    }
}
