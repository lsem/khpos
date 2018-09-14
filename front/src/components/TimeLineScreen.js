import React from "react";
import SchedulerTimeline from "./SchedulerTimeline";
import TechMapCatalogPanel from "./TechMapCatalogPanel";
import WorkersPanel from "./WorkersPanel";
import CustomDragLayer from "./CustomDragLayer";
import "./TimeLineScreen.css";
import _ from "lodash";
import techMapRegistry from "../TechMapRegistry";

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
      schedulerTimelineRect: null,
      initialOffset: null,
      scrollTop: 0
    };
  }

  setScrollTopPositionDebounced = _.debounce(
    pos =>
      this.setState({
        scrollTop: pos
      }),
    30
  );

  onSchedulerTimelineDomNodeRefUpdate(ref) {
    if (ref) {
      this.setState({
        schedulerTimelineRect: this.domRectToInternalRect(
          ref.getBoundingClientRect()
        )
      });
      // subscribe to scroll updates to make scroll position part of state
      // todo: fix back scrolling
      ref.addEventListener("scroll", e => {
        this.setScrollTopPositionDebounced(ref.scrollTop);
      });
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

  onTechMapPreviewEnteredTimeline(initialOffset) {
    // initialOffset indicated an offset between cusrsor position and top left corner
    // of drag layer DOM rect at the moment of entering.
    console.log("DEBUG: onTechMapPreviewEnteredTimeline");
    this.setState(prevState => {
      const haveRectAndInTimeline =
        prevState.techMapPreviewHoverRect !== null &&
        /*prevState.isTechMapHoveringTimeline*/
        true;
      console.log("DEBUG: haveRectAndInTimeline: ", haveRectAndInTimeline);
      return {
        isTechMapOverTimeline: true,
        isTechMapHoveringTimeline: haveRectAndInTimeline,
        initialOffset: initialOffset
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
          /*techMapPreviewHoverRect !== null*/
          true && prevState.isTechMapHoveringTimeline;
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
    } else {
      console.log("DEBUG: onTechMapPreviewDomNodeRefUpdate: dom detached");
      this.setState({
        techMapPreviewHoverRect: null,
        techMapPreviewHoverTranslatedRect: null,
        isTechMapHoveringTimeline: false
      });
    }
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

  onTechMapPreviewOffsetChanged(offset, diffOffset, initialOffset) {
    this.setState(prevState => {
      const stillActual = prevState.isTechMapHoveringTimeline;
      if (!stillActual) {
        // todo: this is known to occur for example in following scenario:
        // Reproducible with trhrotteling this event at rate 1000 / 30
        // in combination with throtelling.
        //   onTechMapPreviewEnteredTimeline
        //   haveRectAndInTimeline:  true
        //   onTechMapPreviewDomNodeRefUpdate: dom detached
        //   onTechMapPreviewLeftTimeline!
        //   onTechMapPreviewFinishedDragging
        //   <this> "not actual any more"
        // Then techMapPreviewHoverRect is null and cannot be used
        console.warn("DEBUG: not actual any more");
        return {};
      }

      let effectivRect = this.translateRectToOtherRect(
        {
          left: offset.x - this.state.initialOffset.x,
          top: offset.y - this.state.initialOffset.y + this.state.scrollTop,
          width: this.state.techMapPreviewHoverRect.width,
          height: this.state.techMapPreviewHoverRect.height
        },
        prevState.schedulerTimelineRect
      );

      return {
        // actually both must be static, can be optimized
        techMapPreviewHoverTranslatedRect: stillActual ? effectivRect : null
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
          scrollTop={this.state.scrollTop}
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
          <TechMapCatalogPanel techMapRegistry={techMapRegistry}/>
          <WorkersPanel />
        </div>
        {/* Instantiate CustomDragLayer to get react-dnd aware about custom drag layey.
          Our of drag and drop context it must not affect rendering. */}
        <CustomDragLayer
          techMapRegistry={techMapRegistry}
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
