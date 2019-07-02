import { getJobs } from "../../sampleData";
import { Dispatch } from "redux";
import { requestJobs, requestJobsSucceeded, setTimeSpan } from "./actions";
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

  }
}

export const thunkPatchJob = (job: Job) => {
  return (dispatch: Dispatch) => {
    
  }
}

export const thunkAssignJob = (jobId: string, stepId: string, employee: Employee) => {
  return (dispatch: Dispatch) => {
    
  }
}
