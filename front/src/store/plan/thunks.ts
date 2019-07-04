import { getJobs } from "../../sampleData";
import { Dispatch } from "redux";
import { requestJobs, requestJobsSucceeded, setTimeSpan, insertJob, deleteJob, patchJob, assignJob } from "./actions";
import TimeSpan from "../../models/plan/timeSpan";
import Job from "../../models/plan/job";
import Employee from "../../models/employees/employee";

export const thunkSetTimeSpan = (timeSpan: TimeSpan) => {
  return (dispatch: Dispatch) => {
    dispatch(setTimeSpan(timeSpan));
    dispatch(requestJobs());
    dispatch(requestJobsSucceeded(getJobs(timeSpan)));
  };
};

export const thunkInsertJob = (job: Job) => {
  return (dispatch: Dispatch) => {
    dispatch(insertJob(job));
  }
}

export const thunkDeleteJob = (job: Job) => {
  return (dispatch: Dispatch) => {
    dispatch(deleteJob(job));
  }
}

export const thunkPatchJob = (job: Job) => {
  return (dispatch: Dispatch) => {
    dispatch(patchJob(job));
  }
}

export const thunkAssignJob = (jobId: string, stepId: string, employee: Employee) => {
  return (dispatch: Dispatch) => {
    dispatch(assignJob(jobId, stepId, employee));
  }
}
