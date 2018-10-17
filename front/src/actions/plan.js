import moment from "moment";
import axios from "axios";
import uuid from "uuid";
import { getApi } from "../api";
import {
  PLAN_REQUEST_JOBS_SUCCEEDED,
  PLAN_SET_TIMESPAN,
  MOVE_JOB,
  MOVE_JOB_ROLLBACK,
  INSERT_JOB,
  INSERT_JOB_ROLLBACK,
  DELETE_JOB,
  DELETE_JOB_ROLLBACK,
  JOB_TASK_ASSIGN
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

export function moveJob(job, column, startTime) {
  const payload = {
    job,
    column,
    startTime
  };
  const patchedJob = {
    ...job,
    column,
    startTime
  };
  return {
    type: MOVE_JOB,
    payload,
    meta: {
      offline: {
        effect: {
          url: `${getApi()}/jobs/${job.id}`,
          method: "PATCH",
          data: patchedJob
        },
        rollback: { type: MOVE_JOB_ROLLBACK, meta: payload }
      }
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

export function deleteJob(job) {
  return {
    type: DELETE_JOB,
    job,
    meta: {
      offline: {
        effect: { url: `${getApi()}/jobs`, method: "DELETE", data: job.id },
        rollback: { type: DELETE_JOB_ROLLBACK, meta: job }
      }
    }
  };
}

export function swapJobs(draggedJob, neighbourJob) {
  return [
    moveJob(draggedJob, draggedJob.column, neighbourJob.startTime),
    moveJob(neighbourJob, neighbourJob.column, draggedJob.startTime)
  ];
}

export function assignJobTask(jobId, taskId, employee) {
  return {
    type: JOB_TASK_ASSIGN,
    payload: { jobId, taskId, employee }
  };
}
