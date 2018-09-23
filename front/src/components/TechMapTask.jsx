import React from "react";

import "./TechMapTask.css";

function TechMapTask(props) {
  const { height, task } = props;
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

  return (
    <div style={taskStyle} title={task.name} className="techMapTask">
      {badges}
    </div>
  );
}

export default TechMapTask;
