import TimeSpan from "../../models/plan/timeSpan";
import Job from "../../models/plan/job";
import Employee from "../../models/employees/employee";

export const PLAN_SET_TIMESPAN = "PLAN_SET_TIMESPAN";
export const PLAN_REQUEST_JOBS = "PLAN_REQUEST_JOBS";
export const PLAN_REQUEST_JOBS_SUCCEEDED = "PLAN_REQUEST_JOBS_SUCCEEDED";
export const PLAN_INSERT_JOB = "INSERT_JOB";
export const PLAN_INSERT_JOB_ROLLBACK = "INSERT_JOB_ROLLBACK";
export const PLAN_DELETE_JOB = "DELETE_JOB";
export const PLAN_DELETE_JOB_ROLLBACK = "DELETE_JOB_ROLLBACK";
export const PLAN_PATCH_JOB = "JOB_PATCH";
export const PLAN_PATCH_JOB_ROLLBACK = "JOB_PATCH_ROLLBACK";
export const PLAN_ASSIGN_JOB = "JOB_ASSIGN";
export const PLAN_ASSIGN_JOB_ROLLBACK = "JOB_ASSIGN_ROLLBACK";

interface SetTimeSpanAction {
  type: typeof PLAN_SET_TIMESPAN;
  payload: TimeSpan;
}

interface RequestJobsAction {
  type: typeof PLAN_REQUEST_JOBS;
  payload: null;
}

interface RequestJobsSucceededAction {
  type: typeof PLAN_REQUEST_JOBS_SUCCEEDED;
  payload: Array<Job>;
}

interface InsertJobAction {
  type: typeof PLAN_INSERT_JOB;
  payload: Job;
}

interface InsertJobRollbackAction {
  type: typeof PLAN_INSERT_JOB_ROLLBACK;
  payload: Job;
}

interface DeleteJobAction {
  type: typeof PLAN_DELETE_JOB;
  payload: Job;
}

interface DeleteJobRollbackAction {
  type: typeof PLAN_DELETE_JOB_ROLLBACK;
  payload: Job;
}

interface PatchJobAction {
  type: typeof PLAN_PATCH_JOB;
  payload: Job;
}

interface PatchJobRollbackAction {
  type: typeof PLAN_PATCH_JOB_ROLLBACK;
  payload: Job;
}

interface AssignJobAction {
  type: typeof PLAN_ASSIGN_JOB;
  payload: { jobId: string; stepId: string; employee: Employee };
}

interface AssignJobRollbackAction {
  type: typeof PLAN_ASSIGN_JOB_ROLLBACK;
  payload: { jobId: string; stepId: string; employee: Employee };
}

export type PlanActionTypes =
  | SetTimeSpanAction
  | RequestJobsAction
  | RequestJobsSucceededAction
  | InsertJobAction
  | InsertJobRollbackAction
  | DeleteJobAction
  | DeleteJobRollbackAction
  | PatchJobAction
  | PatchJobRollbackAction
  | AssignJobAction
  | AssignJobRollbackAction;
