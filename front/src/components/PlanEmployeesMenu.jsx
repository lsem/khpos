import React from "react";
import _ from "lodash";
import PlanEmployeesListItem from "./PlanEmployeesListItem";
import ListView from "./ListView";
import Icon from "./Icon";
import { ICONS } from "../constants/icons";
import "./PlanEmployeesMenu.css";

export default class PlanEmployeesMenu extends React.Component {
  componentDidMount() {
    this.props.requestEmployees();
  }

  render() {
    return (
      <div className="planEmployeesMenu">
        <div className="planEmployeesMenuHeader">
          <Icon icon={ICONS.PEOPLE} size={16} color="#7F7F7F" />
          <span>Працівники</span>
        </div>
        <ListView>
          {_.sortBy(this.props.employees, e => e.firstName).map(employee => (
            <PlanEmployeesListItem
              employee={employee}
              key={employee.id}
              patchEmployee={this.props.patchEmployee}
            />
          ))}
        </ListView>
        <div className="planEmployeesAddButton">
          <Icon icon={ICONS.ADD} size={16} color="#007aff" />
          {" Додати "}
        </div>
      </div>
    );
  }
}
