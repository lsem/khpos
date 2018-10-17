import React, { Component } from "react";
import { DropTarget } from 'react-dnd';

import "./TechMapTask.css";
import dragItemTypes from "../dragItemTypes";

class TechMapTask extends Component {
  render() {
    const { height, task } = this.props;
    let assigned = task.assigned;

    if (!assigned) {
      assigned = [];
    }

    const badges = assigned.map(worker => {
      const badgeStyle = {
        backgroundColor: worker.color
      };

      return (
        <span
          className="techMapTaskBadgeStyle"
          style={badgeStyle}
          key={worker.id}
        />
      );
    });

    const taskStyle = {
      backgroundColor: task.bgColor,
      height: height
    };

    return this.props.connectDropTarget(
      <div style={taskStyle} title={task.name} className="techMapTask">
        {badges}
      </div>
    );
  }
}

export default DropTarget(
  dragItemTypes.SIDEBAR_STAFF, 
  {
    drop(props, monitor) {
      props.assign(props.task.id, monitor.getItem().id);
    }
  }, 
  (connect, monitor) => { 
    return {
      connectDropTarget: connect.dropTarget(),
      hovered: monitor.isOver(),
      item: monitor.getItem()
    }
  }
)(TechMapTask);
