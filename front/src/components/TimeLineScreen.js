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
    this.onTechMapPreviewEnteredTimeline = this.onTechMapPreviewEnteredTimeline.bind(
      this
    );
    this.onTechMapPreviewLeftTimeline = this.onTechMapPreviewLeftTimeline.bind(
      this
    );
    this.onTechMapPreviewStartedDragging = this.onTechMapPreviewStartedDragging.bind(
      this
    );
    this.onTechMapPreviewFinishedDragging = this.onTechMapPreviewFinishedDragging.bind(
      this
    );
    this.onTechMapPreviewDomNodeRefUpdate = this.onTechMapPreviewDomNodeRefUpdate.bind(
      this
    );
    this.onTechMapPreviewOffsetChanged = this.onTechMapPreviewOffsetChanged.bind(this);
    this.state = {
      isTechMapOverTimeline: false,
      isTechMapHoveringTimeline: false,
      techMapPreviewHoverRect: null
    };
  }

  minsToPixels(mins) {
    return this.props.pixelsPerMinute * mins;
  }

  onTechMapPreviewStartedDragging() {
    console.log("DEBUG: onTechMapPreviewStartedDragging");
  }

  onTechMapPreviewFinishedDragging() {
    console.log("DEBUG: onTechMapPreviewFinishedDragging");
    this.setState({
      isTechMapOverTimeline: false,
      isTechMapHoveringTimeline: false
    });
  }

  onTechMapPreviewEnteredTimeline() {
    console.log("DEBUG: onTechMapPreviewEnteredTimeline");
    this.setState(prevState => {
      const haveRectAndInTimeline =
        prevState.techMapPreviewHoverRect !== null &&
        /*prevState.isTechMapHoveringTimeline*/ true;
      console.log("haveRectAndInTimeline: ", haveRectAndInTimeline);
      return {
        isTechMapOverTimeline: true,
        isTechMapHoveringTimeline: haveRectAndInTimeline
      };
    });
  }

  onTechMapPreviewLeftTimeline() {
    console.log("DEBUG: onTechMapPreviewLeftTimeline!");
    this.setState({
      isTechMapOverTimeline: false,
      isTechMapHoveringTimeline: false
    });
  }

  domRectToHoverRect(domRect) {
    return {
      top: domRect.top,
      left: domRect.left,
      width: domRect.width,
      height: domRect.height
    };
  }

  onTechMapPreviewDomNodeRefUpdate(ref) {
    if (ref) {
      this.setState(prevState => {
        // update state only when we have rect and prev state was isTechMapOverTimeline
        console.log(
          "isTechMapHoveringTimeline: pevState.isTechMapOverTimeline: ",
          prevState.isTechMapOverTimeline
        );
        // Reduce state
        const haveRectAndInTimeline =
          /*techMapPreviewHoverRect !== null*/ true &&
          prevState.isTechMapHoveringTimeline;
        console.log("haveRectAndInTimeline: ", haveRectAndInTimeline);
        return {
          techMapPreviewHoverRect: this.domRectToHoverRect(
            ref.getBoundingClientRect()
          ),
          isTechMapHoveringTimeline: haveRectAndInTimeline
        };
      });
      // console.log(
      //   "DEBUG: onTechMapPreviewDomNodeRefUpdate: ",
      //   ref.getBoundingClientRect()
      // );
    } else {
      console.log("DEBUG: onTechMapPreviewDomNodeRefUpdate: dom detached");
      this.setState({
        techMapPreviewHoverRect: null,
        isTechMapHoveringTimeline: false
      });
    }
  }

  onTechMapPreviewOffsetChanged(offset) {
    console.log('DEBUG: onTechMapPreviewOffsetChanged', offset)
  }

  render() {
    return (
      <div className="TimelineScreen">
        <SchedulerTimeline
          presentTechMapHover={this.state.isTechMapHoveringTimeline}
          techMapPreviewHoverRect={this.state.techMapPreviewHoverRect}
          onTechMapPreviewEnteredTimeline={this.onTechMapPreviewEnteredTimeline}
          onTechMapPreviewLeftTimeline={this.onTechMapPreviewLeftTimeline}
          onTechMapPreviewOffsetChanged={this.onTechMapPreviewOffsetChanged}
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
          minsToPixels={this.minsToPixels}
          onTechMapPreviewStartedDragging={this.onTechMapPreviewStartedDragging}
          onTechMapPreviewFinishedDragging={
            this.onTechMapPreviewFinishedDragging
          }
          onTechMapPreviewDomNodeRefUpdate={
            this.onTechMapPreviewDomNodeRefUpdate
          }
        />
      </div>
    );
  }
}
