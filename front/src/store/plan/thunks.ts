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
    dispatch(insertJob(job)); //optimistic
    fetch(`${getApi()}/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=UTF-8"
      },
      body: JSON.stringify(job)
    }).catch(error => {
      console.error(error);
      dispatch(insertJobRollback(job));
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
  return async (dispatch: Dispatch) => {
    dispatch(deleteJob(job)); //optimistic
    fetch(`${getApi()}/jobs/${job.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json;charset=UTF-8"
      }
    }).catch(error => {
      console.error(error);
      dispatch(deleteJobRollback(job));
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
  return async (dispatch: Dispatch) => {
    dispatch(patchJob(job)); //optimistic
    fetch(`${getApi()}/jobs/${job.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json;charset=UTF-8"
      },
      body: JSON.stringify(job)
    }).catch(error => {
      console.error(error);
      dispatch(patchJobRollback(job));
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
    dispatch(assignJob(args.jobId, args.stepId, args.employeeId)); //optimistic
    fetch(`${getApi()}/jobs/${args.jobId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json;charset=UTF-8"
      },
      body: JSON.stringify(getState().plan.jobs.find(j => j.id === args.jobId))
    }).catch(error => {
      console.error(error);
      dispatch(assignJobRollback(args.jobId, args.stepId, args.employeeId));
    });
  };
};
