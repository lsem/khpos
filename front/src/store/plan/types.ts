import TimeSpan from "../../models/plan/timeSpan";
import Job from "../../models/plan/job";
import Employee from "../../models/employees/employee";
import { Action } from "redux";

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

interface SetTimeSpanAction extends Action<typeof PLAN_SET_TIMESPAN> {
  timeSpan: TimeSpan;
}

interface RequestJobsAction extends Action<typeof PLAN_REQUEST_JOBS> {}

interface RequestJobsSucceededAction
  extends Action<typeof PLAN_REQUEST_JOBS_SUCCEEDED> {
  jobs: Array<Job>;
}

interface InsertJobAction extends Action<typeof PLAN_INSERT_JOB> {
  job: Job;
}

interface InsertJobRollbackAction
  extends Action<typeof PLAN_INSERT_JOB_ROLLBACK> {
  job: Job;
}

interface DeleteJobAction extends Action<typeof PLAN_DELETE_JOB> {
  job: Job;
}

interface DeleteJobRollbackAction
  extends Action<typeof PLAN_DELETE_JOB_ROLLBACK> {
  job: Job;
}

interface PatchJobAction extends Action<typeof PLAN_PATCH_JOB> {
  job: Job;
}

interface PatchJobRollbackAction
  extends Action<typeof PLAN_PATCH_JOB_ROLLBACK> {
  job: Job;
}

interface AssignJobAction extends Action<typeof PLAN_ASSIGN_JOB> {
  args: { jobId: string; stepId: string; employee: Employee };
}

interface AssignJobRollbackAction
  extends Action<typeof PLAN_ASSIGN_JOB_ROLLBACK> {
  args: { jobId: string; stepId: string; employee: Employee };
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
