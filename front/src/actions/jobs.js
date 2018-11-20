import axios from "axios";
import moment from "moment";
import uuid from "uuid";
import * as actionTypes from "../actions/types";
import { getApi } from "../api";

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
        dispatch({
          type: actionTypes.PLAN_SET_TIMESPAN,
          payload: { fromDate, toDate }
        });
        dispatch({
          type: actionTypes.PLAN_REQUEST_JOBS_SUCCEEDED,
          payload: res.data
        });
      })
      .catch(err => {
        console.log(err);
      });
  };
};

export function moveJob(id, column, startTime) {
  return (dispatch, getState) => {
    const state = getState();

    const affectedJob = state.jobs.find(j => j.id === id);
    const patchedJob = {
      ...affectedJob,
      column,
      startTime
    };

    dispatch({
      type: actionTypes.JOB_PATCH,
      payload: patchedJob,
      meta: {
        offline: {
          effect: {
            url: `${getApi()}/jobs/${id}`,
            method: "PATCH",
            data: patchedJob
          },
          rollback: { type: actionTypes.JOB_PATCH, meta: affectedJob }
        }
      }
    });
  };
}

export function insertJob(techMapId, column, startTime) {
  return (dispatch, getState) => {
    const state = getState();

    const techMap = state.techMaps.find(t => t.id === techMapId);
    const payload = {
      id: `JOB-${uuid.v1()}`,
      techMap,
      column,
      startTime
    };

    dispatch({
      type: actionTypes.INSERT_JOB,
      payload,
      meta: {
        offline: {
          effect: { url: `${getApi()}/jobs`, method: "POST", data: payload },
          rollback: {
            type: actionTypes.INSERT_JOB_ROLLBACK,
            meta: { id: payload.id }
          }
        }
      }
    });
  };
}

export function deleteJob(id) {
  return (dispatch, getState) => {
    const state = getState();
    const deletedJob = state.jobs.find(j => j.id === id);

    dispatch({
      type: actionTypes.DELETE_JOB,
      id,
      meta: {
        offline: {
          effect: { url: `${getApi()}/jobs`, method: "DELETE", data: id },
          rollback: { type: actionTypes.DELETE_JOB_ROLLBACK, meta: deletedJob }
        }
      }
    });
  };
}

export function swapJobs(draggedJobId, neighbourJobId) {
  return (dispatch, getState) => {
    const state = getState();
    const draggedJob = state.jobs.find(j => j.id === draggedJobId);
    const neighbourJob = state.jobs.find(j => j.id === neighbourJobId);

    dispatch(moveJob(draggedJob, draggedJob.column, neighbourJob.startTime));
    dispatch(moveJob(neighbourJob, neighbourJob.column, draggedJob.startTime));
  };
}

export function assignJobTask(jobId, taskId, employeeId) {
  return (dispatch, getState) => {
    const state = getState();
    const affectedJob = state.jobs.find(j => j.id === jobId);
    const affectedTask = affectedJob.techMap.tasks.find(t => t.id === taskId);
    const employee = state.employees.find(e => e.id === employeeId);

    const newTask = {
      ...affectedTask,
      assigned: affectedTask.assigned
        ? [...affectedTask.assigned, employee]
        : [employee]
    };

    const patchedJob = {
      ...affectedJob,
      techMap: {
        ...affectedJob.techMap,
        tasks: affectedJob.techMap.tasks.map(
          t => (t === affectedTask ? newTask : t)
        )
      }
    };

    dispatch({
      type: actionTypes.JOB_PATCH,
      payload: patchedJob,
      meta: {
        offline: {
          effect: {
            url: `${getApi()}/jobs/${jobId}`,
            method: "PATCH",
            data: patchedJob
          },
          rollback: { type: actionTypes.JOB_PATCH_ROLLBACK, meta: affectedJob }
        }
      }
    });
  };
}
