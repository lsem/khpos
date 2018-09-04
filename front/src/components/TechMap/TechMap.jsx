import React from 'react'

import "./TechMap.css"

function TechMap(props) {
  const { height, tintColor, top, children } = props;

  const techMapStyle = {
    height: height,
    backgroundColor: tintColor,
    top: top,
  };

  return (
    <div className="techMap" style={techMapStyle}>
      <div className="techMapTasksContainer">
        { children }
      </div>
    </div>
  )
}

export default TechMap
