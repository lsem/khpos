import React from "react";
import SchedulerTimeline from "./SchedulerTimeline";
import TechMapCatalogPanel from "./TechMapCatalogPanel";
import WorkersPanel from "./WorkersPanel";
import CustomDragLayer from "./CustomDragLayer";
import "./TimeLineScreen.css";
import { connect } from "react-redux";
import _ from "lodash";

class TimelineScreen extends React.Component {
  constructor(props) {
    super(props);
    this.onDndDragBegin = this.onDndDragBegin.bind(this);
    this.onDndTechMapItemHover = this.onDndTechMapItemHover.bind(this);
    this.queryTechMapHeight = this.queryTechMapHeight.bind(this);
    this.setUpDimensionsResolver = this.setUpDimensionsResolver.bind(this);
    this.isHover = this.isHover.bind(this);
    this.onHover = this.onHover.bind(this);
    this.dimensionsResolver = null;
    this.state = { isHover: false };
  }

  onHover(value) {
    this.state.isHover = value;
  }

  isHover() {
    return this.state.isHover;
  }

  // Timeline sets this to let TimelineScreen know how to
  // resolve techmap dimensions which needed in context of dnd.
  setUpDimensionsResolver(resolver) {
    this.dimensionsResolver = resolver;
  }

  queryTechMapHeight(techMapId) {
    const techMapSpec = _.find(
      this.props.techMapsTimeLine,
      x => x.id == techMapId
    );
    if (!techMapSpec) {
      console.assert(false && "did not find tech map");
      return 0;
    }
    return this.dimensionsResolver().minToPixels(
      techMapSpec.durationHours * 60
    );
  }

  onDndDragBegin(item) {
    console.log("Begin drag: ", item);
  }

  onDndTechMapItemHover(item) {
    console.log("onDndTechMapItemHover: ", item);
  }

  render() {
    return (
      <div className="TimelineScreen">
        <SchedulerTimeline
          onDndTechMapItemHover={this.onDndTechMapItemHover}
          height={500}
          width={800}
          durationScalingFator={100}
          jobWidth={100}
          horizontalPadding={15}
          beginTime={Date.parse("01 Jan 1970 00:00:00 GMT")}
          endTime={Date.parse("02 Jan 1970 00:00:00 GMT")}
          left={0}
          ref={this.timelineRef}
          setUpDimensionsResolver={this.setUpDimensionsResolver}
          onHover={this.onHover}
        />
        <div className="TimelineScreenSideContainer">
          <TechMapCatalogPanel
            onDndDragBegin={this.onDndDragBegin}
            queryTechMapHeight={this.queryTechMapHeight}
            isHover={this.isHover}
          />
          <WorkersPanel />
        </div>
        {/* Instantiate CustomDragLayer to get react-dnd aware about custom drag layey.
        Our of drag and drop context it must not affect rendering. */}
        {/* <CustomDragLayer/> */}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    techMapsTimeLine: state.techMapsTimeLine
  };
};

export default connect(mapStateToProps)(TimelineScreen);
