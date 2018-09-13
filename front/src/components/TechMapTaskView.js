import React from "react";

import "./TechMapTaskView.css";

function TechMapTaskView(props) {
  const { height, name, color } = props;
  let badgeColors = props.badgeColors;

  if (!badgeColors) {
    badgeColors = [];
  }

  const badges = badgeColors.map(badgeColor => {
    const badgeStyle = {
      backgroundColor: badgeColor
    };

    return (
      <span
        className="techMapTaskBadgeStyle"
        style={badgeStyle}
        key={badgeColors.indexOf(badgeColor)}
      />
    );
  });

  const taskStyle = {
    backgroundColor: color,
    height: height
  };

  return (
    <div style={taskStyle} title={name} className="techMapTaskView">
      {badges}
    </div>
  );
}

export default TechMapTaskView;
