import * as React from "react";
import Device from "../models/inventory/device";
import Employee from "../models/employees/employee";
import Ingredient from "../models/ingredients/ingredient";
import Job from "../models/plan/job";
import moment from "moment";
import TechMap from "../models/techMaps/techMap";
import { AnyAction } from "redux";
import { connect } from "react-redux";
import {
  getEmployees,
  getIngredients,
  getInventory,
  getJobs,
  getTechMaps
  } from "../sampleData";
import { ThunkDispatch } from "redux-thunk";
import { thunkInsertEmployee } from "../store/employees/thunks";
import { thunkInsertIngredient } from "../store/ingredients/thunks";
import { thunkInsertInventory } from "../store/inventory/thunks";
import { thunkInsertJob } from "../store/plan/thunks";
import { thunkInsertTechMap } from "../store/techMaps/thunks";

interface IPopulateSampleDataButtonProps {
  insertIngredient: Function;
  insertInventory: Function;
  insertEmployee: Function;
  insertTechMap: Function;
  insertJob: Function;
}

const PopulateSampleDataButton: React.FunctionComponent<
  IPopulateSampleDataButtonProps
> = props => {
  const onButtonClick = () => {
    getIngredients().forEach(i => props.insertIngredient(i));
    getInventory().forEach(i => props.insertInventory(i));
    getEmployees().forEach(e => props.insertEmployee(e));
    getTechMaps().forEach(t => props.insertTechMap(t));
    getJobs({
      fromDate: moment()
        .startOf("day")
        .valueOf(),
      toDate: moment()
        .endOf("day")
        .valueOf()
    }).forEach(j => props.insertJob(j));
  };

  return <button onClick={onButtonClick}> Populate with sample data </button>;
};

const mapStateToProps = () => {
  return {};
};

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
  return {
    insertIngredient: (i: Ingredient) => dispatch(thunkInsertIngredient(i)),
    insertInventory: (i: Device) => dispatch(thunkInsertInventory(i)),
    insertEmployee: (e: Employee) => dispatch(thunkInsertEmployee(e)),
    insertTechMap: (t: TechMap) => dispatch(thunkInsertTechMap(t)),
    insertJob: (j: Job) => dispatch(thunkInsertJob(j))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PopulateSampleDataButton);
