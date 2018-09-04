import React from 'react'

import './TechMapTask.css'

function TechMapTask(props) {

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
        key={badgeColors.indexOf(badgeColor)}></span>
    ) 
  })

  const taskStyle = {
    backgroundColor: color,
    height: height
  }

  return (
    <div style={ taskStyle } title={ name }>
      { badges }
    </div>
  )
}

export default TechMapTask
