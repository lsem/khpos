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
    this.onTechMapPreviewOffsetChanged = this.onTechMapPreviewOffsetChanged.bind(
      this
    );
    this.onSchedulerTimelineDomNodeRefUpdate = this.onSchedulerTimelineDomNodeRefUpdate.bind(
      this
    );
    this.state = {
      isTechMapOverTimeline: false,
      isTechMapHoveringTimeline: false,
      techMapPreviewHoverRect: null,
      techMapPreviewHoverTranslatedRect: null,
      schedulerTimelineRect: null
    };
  }

  onSchedulerTimelineDomNodeRefUpdate(ref) {
    if (ref) {
      this.state.schedulerTimelineRect = this.domRectToInternalRect(
        ref.getBoundingClientRect()
      );
      // subscribe to scroll updates to make scroll position part of state
      // todo: fix back scrolling
      // this.ref.addEventListener("scroll", e => {
      //   this.setStateDebouncedLowRate({ scrollTop: this.ref.scrollTop });
      // });
    } else {
      //console.warn('onSchedulerTimelineDomNodeRefUpdate: dom detached');
    }
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

  domRectToInternalRect(domRect) {
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
        const internalRect = this.domRectToInternalRect(
          ref.getBoundingClientRect()
        );
        return {
          techMapPreviewHoverRect: internalRect,
          techMapPreviewHoverTranslatedRect: internalRect,
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
        techMapPreviewHoverTranslatedRect: null,
        isTechMapHoveringTimeline: false
      });
    }
  }

  translateRectWithOffset(rect, offset) {
    return {
      top: rect.top + offset.y,
      left: rect.left + offset.x
    };
  }

  // Returns rect in respect to otherRect. Both expected to be in world coordinates.
  translateRectToOtherRect(rect, otherRect) {
    return {
      top: rect.top - otherRect.top,
      left: rect.left - otherRect.left,
      width: rect.width,
      height: rect.height
    };
  }

  onTechMapPreviewOffsetChanged(offset, diffOffset) {
    //console.log("DEBUG: onTechMapPreviewOffsetChanged", offset, diffOffset);
    //console.log('DEBUG: translated: ', this.translateRectWithOffset(this.state.techMapPreviewHoverRect, offset))
    this.setState(prevState => {
      const stillActual = prevState.isTechMapHoveringTimeline;
      if (!stillActual) {
        console.log("DEBUG: not actual any more");
      }

      //console.log('techMapPreviewHoverRect: ', this.state.techMapPreviewHoverRect)

      const X = prevState.techMapPreviewHoverRect.left + diffOffset.x;
      const Y = prevState.techMapPreviewHoverRect.top + diffOffset.y;

      console.log('rect WORLD: ', {x: X, y: Y} )
      // const finalRect = this.translateRectToOtherRect(
      //   this.translateRectWithOffset(prevState.techMapPreviewHoverRect, diffOffset),
      //   prevState.schedulerTimelineRect
      // );
      const finalRect = this.translateRectWithOffset(prevState.techMapPreviewHoverRect, diffOffset);
      //console.log('!! finalRect: ', finalRect)
      //console.log('offset: ', offset)
      //console.log('prevState.schedulerTimelineRect: ', prevState.schedulerTimelineRect)
      //console.log('prevState.techMapPreviewHoverRect: ', prevState.techMapPreviewHoverRect)
      return {
        // actually both must be static, can be optimized
        techMapPreviewHoverTranslatedRect: stillActual ? finalRect : null
      };
    });
  }

  render() {
    return (
      <div className="TimelineScreen">
        <SchedulerTimeline
          onSchedulerTimelineDomNodeRefUpdate={
            this.onSchedulerTimelineDomNodeRefUpdate
          }
          presentTechMapHover={this.state.isTechMapHoveringTimeline}
          techMapPreviewHoverRect={this.state.techMapPreviewHoverTranslatedRect}
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
