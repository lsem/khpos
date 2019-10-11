import React, { Component } from "react";
import { DropTarget } from "react-dnd";

import "./TechMapStep.css";
import dragItemTypes from "../dragItemTypes";

class TechMapStep extends Component {
  render() {
    const { height, step, employees, stepAssignments } = this.props;

    const badges = stepAssignments
      ? stepAssignments.map(a => {
          const badgeStyle = {
            backgroundColor: employees.find(e => e.id === a.employeeId).color
          };

          return (
            <span
              className="planTechMapStepBadgeStyle"
              style={badgeStyle}
              key={a.employeeId}
            />
          );
        })
      : null;

    const stepStyle = {
      backgroundColor:
        stepAssignments && stepAssignments.length ? "#d8d8d8" : "#f1f1f1",
      height: height
    };

    return this.props.connectDropTarget(
      <div style={stepStyle} title={step.name} className="planTechMapStep">
        {badges}
      </div>
    );
  }
}

export default DropTarget(
  dragItemTypes.SIDEBAR_STAFF,
  {
    drop(props, monitor) {
      props.assign(props.step.id, monitor.getItem().id);
    }
  },
  (connect, monitor) => {
    return {
      connectDropTarget: connect.dropTarget(),
      hovered: monitor.isOver(),
      item: monitor.getItem()
    };
  }
)(TechMapStep);
