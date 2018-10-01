import moment from "moment";
import axios from "axios";
import uuid from "uuid";
import { getApi } from "../api";
import {
  PLAN_REQUEST_JOBS_SUCCEEDED,
  PLAN_SET_TIMESPAN,
  MOVE_JOB,
  INSERT_JOB,
  INSERT_JOB_ROLLBACK,
  SWAP_JOBS
} from "./types";

export const requestJobsSucceded = jobs => {
  return { type: PLAN_REQUEST_JOBS_SUCCEEDED, jobs };
};
export const setTimeSpan = (fromDate, toDate) => {
  return { type: PLAN_SET_TIMESPAN, timeSpan: { fromDate, toDate } };
};

export const requestJobs = (fromDate, toDate) => {
  return dispatch => {
    axios
      .get(`${getApi()}/jobs`, {
        params: {
          fromDate: moment(fromDate).toISOString(),
          toDate: moment(toDate).toISOString()
        }
      })
      .then(res => {
        dispatch(setTimeSpan(fromDate, toDate));
        dispatch(requestJobsSucceded(res.data));
      })
      .catch(err => {
        console.log(err);
      });
  };
};

export function moveJob(jobId, column, timeMinutes) {
  return {
    type: MOVE_JOB,
    payload: {
      jobId: jobId,
      column: column,
      timeMinutes: timeMinutes
    }
  };
}

export function insertJob(techMap, column, startTime) {
  const payload = {
    id: `JOB-${uuid.v1()}`,
    techMap,
    column,
    startTime
  };
  return {
    type: INSERT_JOB,
    payload,
    meta: {
      offline: {
        effect: { url: `${getApi()}/jobs`, method: "POST", data: payload },
        rollback: { type: INSERT_JOB_ROLLBACK, meta: { id: payload.id } }
      }
    }
  };
}

export function swapJobs(draggedJobId, neighbourJobId) {
  return {
    type: SWAP_JOBS,
    payload: {
      draggedJobId: draggedJobId,
      neighbourJobId: neighbourJobId
    }
  };
}
