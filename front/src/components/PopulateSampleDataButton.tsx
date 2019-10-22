import * as React from "react";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import { thunkInsertEmployee } from "../store/employees/thunks";
import { thunkInsertTechMap } from "../store/techMaps/thunks";
import { thunkInsertJob } from "../store/plan/thunks";
import { getEmployees, getTechMaps, getJobs, getIngredients } from "../sampleData";
import moment from "moment";
import Employee from "../models/employees/employee";
import TechMap from "../models/techMaps/techMap";
import Job from "../models/plan/job";
import Ingredient from "../models/ingredients/ingredient";
import { thunkInsertIngredient } from "../store/ingredients/thunks";

interface IPopulateSampleDataButtonProps {
  insertIngredient: Function;
  insertEmployee: Function;
  insertTechMap: Function;
  insertJob: Function;
}

const PopulateSampleDataButton: React.FunctionComponent<
  IPopulateSampleDataButtonProps
> = props => {
  const onButtonClick = () => {
    getIngredients().forEach(i => props.insertIngredient(i));
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
    insertEmployee: (e: Employee) => dispatch(thunkInsertEmployee(e)),
    insertTechMap: (t: TechMap) => dispatch(thunkInsertTechMap(t)),
    insertJob: (j: Job) => dispatch(thunkInsertJob(j))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PopulateSampleDataButton);
