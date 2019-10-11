import * as actionTypes from "./types";
import Job from "../../models/plan/job";
import TimeSpan from "../../models/plan/timeSpan";

export function setTimeSpan(timeSpan: TimeSpan): actionTypes.PlanActionTypes {
  return {
    type: actionTypes.PLAN_SET_TIMESPAN,
    timeSpan: timeSpan
  };
}

export function requestJobs(): actionTypes.PlanActionTypes {
  return {
    type: actionTypes.PLAN_REQUEST_JOBS
  };
}

export function requestJobsSucceeded(
  jobs: Array<Job>
): actionTypes.PlanActionTypes {
  return {
    type: actionTypes.PLAN_REQUEST_JOBS_SUCCEEDED,
    jobs: jobs
  };
}

export function insertJob(job: Job): actionTypes.PlanActionTypes {
  return {
    type: actionTypes.PLAN_INSERT_JOB,
    job: job
  };
}

export function insertJobRollback(job: Job): actionTypes.PlanActionTypes {
  return {
    type: actionTypes.PLAN_INSERT_JOB_ROLLBACK,
    job: job
  };
}

export function deleteJob(job: Job): actionTypes.PlanActionTypes {
  return {
    type: actionTypes.PLAN_DELETE_JOB,
    job: job
  };
}

export function deleteJobRollback(job: Job): actionTypes.PlanActionTypes {
  return {
    type: actionTypes.PLAN_DELETE_JOB_ROLLBACK,
    job: job
  };
}

export function patchJob(job: Job): actionTypes.PlanActionTypes {
  return {
    type: actionTypes.PLAN_PATCH_JOB,
    job: job
  };
}

export function patchJobRollback(job: Job): actionTypes.PlanActionTypes {
  return {
    type: actionTypes.PLAN_PATCH_JOB_ROLLBACK,
    job: job
  };
}

export function assignJob(
  jobId: string,
  stepId: string,
  employeeId: string
): actionTypes.PlanActionTypes {
  return {
    type: actionTypes.PLAN_ASSIGN_JOB,
    args: { jobId, stepId, employeeId }
  };
}

export function assignJobRollback(
  jobId: string,
  stepId: string,
  employeeId: string
): actionTypes.PlanActionTypes {
  return {
    type: actionTypes.PLAN_ASSIGN_JOB_ROLLBACK,
    args: { jobId, stepId, employeeId }
  };
}
