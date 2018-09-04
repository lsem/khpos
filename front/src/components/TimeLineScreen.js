import React from "react";
import SchedulerTimeline from "./SchedulerTimeline";
import TechMapCatalogPanel from "./TechMapCatalogPanel";
import WorkersPanel from "./WorkersPanel";
import './TimeLineScreen.css'

export default class TimelineScreen extends React.Component {
  render() {
    return (
      <div className="TimelineScreen">
        <SchedulerTimeline
          height={500}
          durationScalingFator={100}
          jobWidth={150}
          horizontalPadding={15}
          beginTime={Date.parse("01 Jan 1970 00:00:00 GMT")}
          endTime={Date.parse("02 Jan 1970 00:00:00 GMT")}
          left={0}
        />
        <div className="TimelineScreenSideContainer">
          <TechMapCatalogPanel />
          <WorkersPanel />
        </div>
      </div>
    );
  }
}
