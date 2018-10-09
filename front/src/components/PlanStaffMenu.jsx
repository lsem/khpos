import React from "react";
import _ from "lodash";
import PlanStaffListItem from "./PlanStaffListItem";
import ListView from "./ListView";
import Icon from "./Icon";
import { ICONS } from "../constants/icons";
import "./PlanStaffMenu.css";

export default class PlanStaffMenu extends React.Component {
  componentDidMount() {
    this.props.requestStaff();
  }

  render() {
    return (
      <div className="planStaffMenu">
        <div className="planStaffMenuHeader">
          <Icon icon={ICONS.PEOPLE} size={16} color="#7F7F7F" />
          <h6>Працівники</h6>
        </div>
        <ListView>
          {_.sortBy(this.props.staff, e => e.firstName).map(employee => (
            <PlanStaffListItem
              employee={employee}
              key={employee.id}
              patchEmployee={this.props.patchEmployee}
            />
          ))}
        </ListView>
        <div className="planStaffAddButton">
          <Icon icon={ICONS.ADD} size={16} color="#007aff" />
          {" Додати "}
        </div>
      </div>
    );
  }
}
