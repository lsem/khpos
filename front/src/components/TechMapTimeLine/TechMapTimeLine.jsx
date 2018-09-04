import React, { Component } from 'react'
import _ from 'lodash'

import TechMap from '../TechMap/TechMap'
import TechMapTask from '../TechMapTask/TechMapTask'
import { getSampleTechMaps, getSampleBadgeColors } from '../../helpers/SampleData'
import "./TechMapTimeLine.css"

export default class TechMapTimeLine extends Component {
  constructor(props) {
    super(props);

    this.state = { techMaps: getSampleTechMaps() };
  }

  render() {
    const { containerHeight, containerWidth, contentHeight, 
      beginTime, endTime, columnWidth, gap } = this.props;
    const minsToMills = mins => { return mins * 60 * 1000 };
    const pixelsInMill = contentHeight / (endTime - beginTime);
    const overlaped = (start1, end1, start2, end2) => { 
      if (end1 <= start2) { return false; } else if (start1 >= end2) { return false; } else { return true; }
    }

    const groupTechMapsByColumns = (tms) => {      
      const groups = {};

      const pushToGroupIfNotOverlap = (tm, groupId) =>
      {
        if (!groups[groupId])
        {
          groups[groupId] = [tm];
        } else {
          if (_.every(groups[groupId], gtm => { 
            return !overlaped(tm.startTime, tm.endTime, gtm.startTime, gtm.endTime) })) {
              groups[groupId].push(tm);
          } else {
            pushToGroupIfNotOverlap(tm, ++groupId);
          }
        }
      }
  
      _(tms).forEach(tm => {
        let groupId = 0;
        pushToGroupIfNotOverlap(tm, groupId);
      });

      return groups;
    }

    const topFor = tm => { return (tm.startTime - beginTime) * pixelsInMill };
    const heightFor = tm => { return (tm.endTime - tm.startTime) * pixelsInMill };
    const columnGroups = groupTechMapsByColumns(this.state.techMaps);

    let gridTemplateColumns = "";
    
    _.forEach(columnGroups, g => { gridTemplateColumns += ` ${columnWidth}px` });

    const containerStyle = {
      height: containerHeight,
	    width: containerWidth,
    }

    const gridContainerStyle = {
      height: contentHeight,
      gridTemplateColumns: gridTemplateColumns,
      gridGap: gap
    }

    const columnGroupKeys = Object.keys(columnGroups);
    const techMapsInColumnsView = _.map(columnGroupKeys, k => {
      return (
        <div className="techMapGridColumn" key={ columnGroupKeys.indexOf(k) }>
          { 
            columnGroups[k].map(tm => {
              return (
                <TechMap
                  name={tm.name}
                  tintColor={tm.tintColor}
                  height={heightFor(tm)}
                  width={columnWidth}
                  top={topFor(tm)}
                  key={tm.id}>

                  {
                    tm.tasks.map(task => {
                      return (
                        <TechMapTask
                          height={minsToMills(task.durationMinutes) * pixelsInMill}
                          name={task.name}
                          color={task.color}
                          badgeColors={getSampleBadgeColors()}
                          key={task.id}
                        />
                      )
                    })
                  }
                </TechMap>
              )
            }) 
          }
        </div>
      )
    })

    return (
      <div className="techMapMainContainer" style={containerStyle}>
        <div className="techMapGridContainer" style={gridContainerStyle}>
          { techMapsInColumnsView }
        </div>
      </div>
    )
  }
}
