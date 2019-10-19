import { Dispatch, ActionCreator } from "redux";
import {
  requestJobs,
  requestJobsSucceeded,
  setTimeSpan,
  insertJob,
  deleteJob,
  patchJob,
  assignJob,
  insertJobRollback,
  deleteJobRollback,
  patchJobRollback,
  assignJobRollback
} from "./actions";
import TimeSpan from "../../models/plan/timeSpan";
import Job from "../../models/plan/job";
import { ThunkAction } from "redux-thunk";
import { PlanActionTypes } from "./types";
import { AppState } from "..";
import { getApi } from "../../api";

export const thunkSetTimeSpan: ActionCreator<
  ThunkAction<
    void, // The type of function return
    AppState, // The type of global state
    TimeSpan, // The type of the thunk parameter
    PlanActionTypes // The type of the last action to be dispatched
  >
> = timeSpan => {
  return async (dispatch: Dispatch) => {
    dispatch(setTimeSpan(timeSpan));
    dispatch(requestJobs());

    fetch(`${getApi()}/jobs`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json;charset=UTF-8"
      }
    })
      .then(res => res.json())
      .then(data => {
        dispatch(requestJobsSucceeded(data));
      })
      .catch(error => console.error(error));
  };
};

export const thunkInsertJob: ActionCreator<
  ThunkAction<
    void, // The type of function return
    AppState, // The type of global state
    Job, // The type of the thunk parameter
    PlanActionTypes // The type of the last action to be dispatched
  >
> = job => {
  return async (dispatch: Dispatch) => {
    dispatch({
      ...insertJob(job),
      meta: {
        offline: {
          effect: {
            url: `${getApi()}/jobs`,
            method: "POST",
            json: job
          },
          rollback: insertJobRollback(job)
        }
      }
    });
  };
};

export const thunkDeleteJob: ActionCreator<
  ThunkAction<
    void, // The type of function return
    AppState, // The type of global state
    Job, // The type of the thunk parameter
    PlanActionTypes // The type of the last action to be dispatched
  >
> = job => {
  return async (dispatch) => {
    dispatch({
      ...deleteJob(job),
      meta: {
        offline: {
          effect: {
            url: `${getApi()}/jobs/${job.id}`,
            method: "DELETE",
            json: job
          },
          rollback: deleteJobRollback(job)
        }
      }
    });
  };
};

export const thunkPatchJob: ActionCreator<
  ThunkAction<
    void, // The type of function return
    AppState, // The type of global state
    Job, // The type of the thunk parameter
    PlanActionTypes // The type of the last action to be dispatched
  >
> = job => {
  return async (dispatch, getState) => {
    const affectedJob = getState().plan.jobs.find(j => j.id === job.id) as Job;

    dispatch({
      ...patchJob(job),
      meta: {
        offline: {
          effect: {
            url: `${getApi()}/jobs/${job.id}`,
            method: "PATCH",
            json: job
          },
          rollback: patchJobRollback(affectedJob)
        }
      }
    });
  };
};

export const thunkAssignJob: ActionCreator<
  ThunkAction<
    void, // The type of function return
    AppState, // The type of global state
    { jobId: string; stepId: string; employeeId: string }, // The type of the thunk parameter
    PlanActionTypes // The type of the last action to be dispatched
  >
> = args => {
  return async (dispatch: Dispatch, getState: () => AppState) => {
    dispatch({
      ...assignJob(args.jobId, args.stepId, args.employeeId),
      meta: {
        offline: {
          effect: {
            url: `${getApi()}/jobs/${args.jobId}`,
            method: "PATCH",
            json: getState().plan.jobs.find(j => j.id === args.jobId)
          },
          rollback: assignJobRollback(args.jobId, args.stepId, args.employeeId)
        }
      }
    });
  };
};
