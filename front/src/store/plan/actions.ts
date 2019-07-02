import * as actionTypes from "./types";
import Job from "../../models/plan/job";
import TimeSpan from "../../models/plan/timeSpan";
import Employee from "../../models/employees/employee";

export function setTimeSpan(timeSpan: TimeSpan): actionTypes.PlanActionTypes {
  return {
    type: actionTypes.PLAN_SET_TIMESPAN,
    payload: timeSpan
  };
}

export function requestJobs(): actionTypes.PlanActionTypes {
  return {
    type: actionTypes.PLAN_REQUEST_JOBS,
    payload: null
  };
}

export function requestJobsSucceeded(
  jobs: Array<Job>
): actionTypes.PlanActionTypes {
  return {
    type: actionTypes.PLAN_REQUEST_JOBS_SUCCEEDED,
    payload: jobs
  };
}

export function insertJob(job: Job): actionTypes.PlanActionTypes {
  return {
    type: actionTypes.PLAN_INSERT_JOB,
    payload: job
  };
}

export function insertJobRollback(job: Job): actionTypes.PlanActionTypes {
  return {
    type: actionTypes.PLAN_INSERT_JOB_ROLLBACK,
    payload: job
  };
}

export function deleteJob(job: Job): actionTypes.PlanActionTypes {
  return {
    type: actionTypes.PLAN_DELETE_JOB,
    payload: job
  };
}

export function deleteJobRollback(job: Job): actionTypes.PlanActionTypes {
  return {
    type: actionTypes.PLAN_DELETE_JOB_ROLLBACK,
    payload: job
  };
}

export function patchJob(job: Job): actionTypes.PlanActionTypes {
  return {
    type: actionTypes.PLAN_PATCH_JOB,
    payload: job
  };
}

export function patchJobRollback(job: Job): actionTypes.PlanActionTypes {
  return {
    type: actionTypes.PLAN_PATCH_JOB_ROLLBACK,
    payload: job
  };
}

export function assignJob(
  jobId: string,
  stepId: string,
  employee: Employee
): actionTypes.PlanActionTypes {
  return {
    type: actionTypes.PLAN_ASSIGN_JOB,
    payload: { jobId, stepId, employee }
  };
}

export function assignJobRollback(
  jobId: string,
  stepId: string,
  employee: Employee
): actionTypes.PlanActionTypes {
  return {
    type: actionTypes.PLAN_ASSIGN_JOB_ROLLBACK,
    payload: { jobId, stepId, employee }
  };
}
