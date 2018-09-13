import React from "react";
import SchedulerTimeline from "./SchedulerTimeline";
import TechMapCatalogPanel from "./TechMapCatalogPanel";
import WorkersPanel from "./WorkersPanel";
import CustomDragLayer from "./CustomDragLayer";
import "./TimeLineScreen.css";

export default class TimelineScreen extends React.Component {
  constructor(props) {
    super(props);
    this.minsToPixels = this.minsToPixels.bind(this);
    this.onTechMapPreviewEnteredTimeline = this.onTechMapPreviewEnteredTimeline.bind(this);
    this.onTechMapPreviewLeftTimeline = this.onTechMapPreviewLeftTimeline.bind(this);
    this.onTechMapPreviewStartedDragging = this.onTechMapPreviewStartedDragging.bind(this);
    this.onTechMapPreviewFinishedDragging = this.onTechMapPreviewFinishedDragging.bind(this);
  }

  minsToPixels(mins) {
    return this.props.pixelsPerMinute * mins;
  }

  onTechMapPreviewStartedDragging() {
    console.log('DEBUG: onTechMapPreviewStartedDragging')
  }

  onTechMapPreviewFinishedDragging() {
    console.log('DEBUG: onTechMapPreviewFinishedDragging')
  }

  onTechMapPreviewEnteredTimeline() {
    console.log('DEBUG: onTechMapPreviewEnteredTimeline')
  }

  onTechMapPreviewLeftTimeline() {
    console.log('DEBUG: onTechMapPreviewLeftTimeline')
  }

  render() {
    return (
      <div className="TimelineScreen">
        <SchedulerTimeline
          onTechMapPreviewEnteredTimeline={this.onTechMapPreviewEnteredTimeline}
          onTechMapPreviewLeftTimeline={this.onTechMapPreviewLeftTimeline}
          minsToPixels={this.minsToPixels}
          height={500}
          width={800}
          durationScalingFator={100}
          jobWidth={100}
          horizontalPadding={15}
          beginTime={Date.parse("01 Jan 1970 00:00:00 GMT")}
          endTime={Date.parse("02 Jan 1970 00:00:00 GMT")}
          left={0}
          ref={this.timelineRef}
        />
        <div className="TimelineScreenSideContainer">
          <TechMapCatalogPanel />
          <WorkersPanel />
        </div>
        {/* Instantiate CustomDragLayer to get react-dnd aware about custom drag layey.
        Our of drag and drop context it must not affect rendering. */}
        <CustomDragLayer
          onTechMapPreviewStartedDragging={this.onTechMapPreviewStartedDragging}
          onTechMapPreviewFinishedDragging={this.onTechMapPreviewFinishedDragging}
        />
      </div>
    );
  }
}
