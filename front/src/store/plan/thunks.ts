import { getJobs } from "../../sampleData";
import { Dispatch, ActionCreator } from "redux";
import {
  requestJobs,
  requestJobsSucceeded,
  setTimeSpan,
  insertJob,
  deleteJob,
  patchJob,
  assignJob
} from "./actions";
import TimeSpan from "../../models/plan/timeSpan";
import Job from "../../models/plan/job";
import Employee from "../../models/employees/employee";
import { ThunkAction } from "redux-thunk";
import { PlanActionTypes } from "./types";
import { AppState } from "..";

export const thunkSetTimeSpan: ActionCreator<
  ThunkAction<
    Promise<PlanActionTypes>, // The type of function return
    AppState, // The type of global state
    TimeSpan, // The type of the thunk parameter
    PlanActionTypes // The type of the last action to be dispatched
  >
> = timeSpan => {
  return async (dispatch: Dispatch) => {
    dispatch(setTimeSpan(timeSpan));
    dispatch(requestJobs());

    const jobs = await getJobs(timeSpan);

    return dispatch(requestJobsSucceeded(jobs));
  };
};

export const thunkInsertJob: ActionCreator<
  ThunkAction<
    Promise<PlanActionTypes>, // The type of function return
    AppState, // The type of global state
    Job, // The type of the thunk parameter
    PlanActionTypes // The type of the last action to be dispatched
  >
> = job => {
  return async (dispatch: Dispatch) => {
    return dispatch(insertJob(job));
  };
};

export const thunkDeleteJob: ActionCreator<
  ThunkAction<
    Promise<PlanActionTypes>, // The type of function return
    AppState, // The type of global state
    Job, // The type of the thunk parameter
    PlanActionTypes // The type of the last action to be dispatched
  >
> = job => {
  return async (dispatch: Dispatch) => {
    return dispatch(deleteJob(job));
  };
};

export const thunkPatchJob: ActionCreator<
  ThunkAction<
    Promise<PlanActionTypes>, // The type of function return
    AppState, // The type of global state
    Job, // The type of the thunk parameter
    PlanActionTypes // The type of the last action to be dispatched
  >
> = job => {
  return async (dispatch: Dispatch) => {
    return dispatch(patchJob(job));
  };
};

export const thunkAssignJob: ActionCreator<
  ThunkAction<
    Promise<PlanActionTypes>, // The type of function return
    AppState, // The type of global state
    { jobId: string; stepId: string; employee: Employee }, // The type of the thunk parameter
    PlanActionTypes // The type of the last action to be dispatched
  >
> = args => {
  return async (dispatch: Dispatch) => {
    return dispatch(assignJob(args.jobId, args.stepId, args.employee));
  };
};
