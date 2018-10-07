import React, { Component } from "react";
import classNames from "classnames";
import "./PlanStaffListItem.css";

export default class PlanStaffListItem extends Component {
  render() {
    const badgeStyle = {
      backgroundColor: this.props.worker.color
    };

    const liClasses = classNames("planStaffListItem", {
      planStaffListItemSelected: this.props.selected
    });

    const badgeClasses = classNames("badge", {
      badgeSelected: this.props.selected
    });

    return (
      <li onClick={this.props.onClick} className={liClasses}>
        <span style={badgeStyle} className={badgeClasses} />
        <span>{this.props.worker.firstName}</span>
      </li>
    );
  }
}
