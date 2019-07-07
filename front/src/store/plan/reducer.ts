import {
  PlanActionTypes,
  PLAN_REQUEST_JOBS_SUCCEEDED,
  PLAN_SET_TIMESPAN,
  PLAN_INSERT_JOB,
  PLAN_INSERT_JOB_ROLLBACK,
  PLAN_DELETE_JOB,
  PLAN_DELETE_JOB_ROLLBACK,
  PLAN_PATCH_JOB,
  PLAN_PATCH_JOB_ROLLBACK,
  PLAN_ASSIGN_JOB,
  PLAN_ASSIGN_JOB_ROLLBACK
} from "./types";
import Job from "../../models/plan/job";
import moment from "moment";
import TimeSpan from "../../models/plan/timeSpan";
import Employee from "../../models/employees/employee";
import { Reducer } from "redux";

const initialState = {
  jobs: [] as Array<Job>,
  timeSpan: {
    fromDate: moment()
      .startOf("day")
      .valueOf(),
    toDate: moment()
      .endOf("day")
      .valueOf()
  } as TimeSpan
};

export const planReducer: Reducer<
  typeof initialState,
  PlanActionTypes
> = (state = initialState, action) => {
  switch (action.type) {
    case PLAN_SET_TIMESPAN:
      return { ...state, timeSpan: action.timeSpan };
    case PLAN_REQUEST_JOBS_SUCCEEDED:
      return { ...state, jobs: action.jobs };
    case PLAN_INSERT_JOB:
    case PLAN_DELETE_JOB_ROLLBACK:
      return { ...state, jobs: [...state.jobs, action.job] };
    case PLAN_INSERT_JOB_ROLLBACK:
    case PLAN_DELETE_JOB:
      return { ...state, jobs: state.jobs.filter(j => j.id !== action.job.id) };
    case PLAN_PATCH_JOB:
    case PLAN_PATCH_JOB_ROLLBACK:
      return { ...state, jobs: state.jobs.map(j => j.id === action.job.id ? action.job : j) };
    case PLAN_ASSIGN_JOB: {
      const { jobId, employee } = action.args;
      const affectedJob = { ...state.jobs.find(j => j.id === jobId) } as Job;
      if (!affectedJob.assigns) affectedJob.assigns = new Map<string, Employee[]>();
      if (!affectedJob.assigns.has(employee.id)) affectedJob.assigns.set(employee.id, []);
      (affectedJob.assigns.get(employee.id) as Employee[]).push(employee);

      return { ...state, jobs: state.jobs.map(j => j.id === jobId ? affectedJob : j) }
    }
    case PLAN_ASSIGN_JOB_ROLLBACK: {
      const { jobId, employee } = action.args;
      const affectedJob = { ...state.jobs.find(j => j.id === jobId) } as Job;
      ((affectedJob.assigns as Map<string, Employee[]>).get(employee.id) as Employee[])
        .filter(e => e.id !== employee.id);

      return { ...state, jobs: state.jobs.map(j => j.id === jobId ? affectedJob : j) }
    }
    default:
      return state;
  }
}