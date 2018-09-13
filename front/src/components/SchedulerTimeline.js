import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import classNames from "classnames";
import { DropTarget } from "react-dnd";
import TechMapView from "./TechMapView";
import { autoLayout } from "../helpers/layout";
import _ from "lodash";
import "./SchedulerTimeline.css";

function collect(connect, monitor) {
  return {
    canDrop: monitor.canDrop(),
    isOver: monitor.isOver(),
    connectDropTarget: connect.dropTarget(),
    initialClientOffset: monitor.getInitialClientOffset(),
    initialSourceClientOffset: monitor.getInitialSourceClientOffset(),
    item: monitor.getItem(),
    sourceClientOffset: monitor.getSourceClientOffset(),
    clientOffset: monitor.getClientOffset()
  };
}
// Spec
const SchedulerTimelineDndSpec = {
  drop(props, monitor) {
    // moveKnight(props.x, props.y);
  },
  hover(props, monitor, component) {
    // It looks like hover() is the only method we can constant
    // flow of dragging events so this is good place to
    // propagate signal to timeline about cursor position changes.
    if (!monitor.isOver()) {
      return;
    }
    if (!monitor.canDrop()) return;
    // TODO: Why this does not work? it must be working according to the docs.
    // const timeLine = component.getDecoratedComponentInstance();
    component.onOffsetChanged(
      monitor.getClientOffset(),
      monitor.getDifferenceFromInitialOffset(),
      monitor.getInitialClientOffset()
    );
  }
};

class SchedulerTimeline extends React.Component {
  // to Taras: try paling by changing throttle to debounce if you are not aware
  // about this stuff.
  offsetChangeDebounced = _.debounce(
    (offset, diffOffset, initialOffset) =>
      this.props.onTechMapPreviewOffsetChanged(
        offset,
        diffOffset,
        initialOffset
      ),
    1000 / 15 /*in combination with throttling must yield to X fps*/
  );

  onOffsetChanged(offset, diffOffset, initialOffset) {
    if (this.lastOffset !== offset) {
      this.lastOffset = offset;
      // this.props.onTechMapPreviewOffsetChanged(
      this.offsetChangeDebounced(offset, diffOffset, initialOffset);
    }
  }

  constructor(props) {
    super(props);
    this.lastOffset = null;
    this.state = {
      jobs: props.techMapsTimeLine
    };
    this.frameNum = 0;
    this.moveTechMap = this.moveTechMap.bind(this);
  }

  moveTechMap() {
    console.log("SchedulerTimeline: moveTechMap()");
  }

  componentWillReceiveProps(nextProps) {
    // TODO: Find other place to do this logic.
    //  Changing state in this method is not recommended,
    //  and that is why we can sometimes observe different inconsistencies.
    // https://reactjs.org/docs/react-component.html#unsafe_componentwillreceiveprops
    // https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html
    if (!this.props.isOver && nextProps.isOver) {
      const diffX =
        this.props.initialClientOffset.x -
        this.props.initialSourceClientOffset.x;
      const diffY =
        this.props.initialClientOffset.y -
        this.props.initialSourceClientOffset.y;
      this.props.onTechMapPreviewEnteredTimeline({ x: diffX, y: diffY });
    }
    if (this.props.isOver && !nextProps.isOver) {
      this.props.onTechMapPreviewLeftTimeline();
    }

    if (this.props.isOverCurrent && !nextProps.isOverCurrent) {
      // You can be more specific and track enter/leave
      // shallowly, not including nested targets
    }
  }

  render() {
    const minutesToMs = min => min * 1000 * 60;
    const msToMins = ms => ms / (1000 * 60);
    const msToPixels = ms => this.props.minsToPixels(msToMins(ms));
    const jobTop = j => msToPixels(j.startTime - this.props.beginTime);
    const jobDurationMins = j =>
      j.techMap.tasks.reduce((result, task) => result + task.durationMins, 0);

    const jobLayoutMapper = {
      vbegin: x => x.startTime,
      vend: x => x.startTime + minutesToMs(jobDurationMins(x)),
      identity: x => x.title
    };
    const layout = autoLayout(this.state.jobs, jobLayoutMapper);
    //const layout = autoLayout_dumb(this.state.jobs, jobLayoutMapper);

    const groupedByCols = _.groupBy(layout, x => x.col);
    const columnViews = _.keys(groupedByCols).map((x, x_idx) => {
      const columnJobIds = _.map(groupedByCols[x], x => x.item.id);
      const columnJobs = _.filter(this.state.jobs, x =>
        _.includes(columnJobIds, x.id)
      );
      const columnTechMaps = columnJobs.map((job, idx) => {
        return (
          <TechMapView
            title={job.techMap.name}
            tintColor={job.techMap.tintColor}
            msToPixels={msToPixels}
            left={0}
            width={this.props.jobWidth}
            top={jobTop(job)}
            key={job.id}
            moveTechMap={this.moveTechMap}
            getContainerRect={this.getContainerRect}
            colIndex={idx}
            rowIndex={x_idx}
            tasks={job.techMap.tasks}
          />
        );
      });
      const style = {
        left: x_idx * (this.props.jobWidth + 10),
        width: this.props.jobWidth,
        height: msToPixels(this.props.endTime)
      };
      return (
        <div className="SchedulerTimelineColumn" style={style}>
          <div className={className}>{columnTechMaps}</div>
        </div>
      );
    });
    // Style ovverides
    const style = {
      left: this.props.left,
      height: this.props.height,
      width: this.props.width
    };
    const { canDrop, isOver, connectDropTarget } = this.props;

    //console.log("SchedulerTimeLine: render: ", this.frameNum++);

    let className = classNames({
      SchedulerTimeline: true,
      "SchedulerTimeline--highlighted": canDrop,
      "SchedulerTimeline--hovered": isOver
    });

    const doTimelineRendering = () => {
      if (!this.props.presentTechMapHover) {
        // Rendering of scene without drag layer tracking
        return (
          <div
            className={className}
            style={style}
            ref={this.props.onSchedulerTimelineDomNodeRefUpdate}
          >
            {columnViews}
          </div>
        );
      }

      const draggedViewRect = this.props.techMapPreviewHoverRect;
      const topLineY = draggedViewRect.top;
      const bottomLineY = draggedViewRect.top + draggedViewRect.height - 1;
      const leftLineX = draggedViewRect.left;
      const rightLineX = draggedViewRect.left + draggedViewRect.width - 1;
      const hLineStyle = top => {
        return {
          position: "absolute",
          backgroundColor: "rgba(0, 0, 0, 0.1)",
          width: this.props.width,
          height: 1,
          left: 0,
          top: top
        };
      };

      const vLineStyle = left => {
        return {
          position: "absolute",
          backgroundColor: "rgba(0, 0, 0, 0.1)",
          width: 1,
          height: this.props.height,
          left: left,
          top: this.props.scrollTop
        };
      };
      return (
        <div
          className={className}
          style={style}
          ref={this.props.onSchedulerTimelineDomNodeRefUpdate}
        >
          <div
            className={className + "-dnd-special"}
            style={hLineStyle(topLineY)}
          />
          <div
            className={className + "-dnd-special"}
            style={hLineStyle(bottomLineY)}
          />
          <div
            className={className + "-dnd-special"}
            style={vLineStyle(leftLineX)}
          />
          <div
            className={className + "-dnd-special"}
            style={vLineStyle(rightLineX)}
          />
          {columnViews}
        </div>
      );
    };
    return connectDropTarget(doTimelineRendering());
  }
}

const mapStateToProps = state => {
  return {
    techMapsTimeLine: state.techMapsTimeLine,
    techMapTasks: state.techMapTasks
  };
};

export default _.flow(
  DropTarget(
    ["techmap", "techmap-panel-item"],
    SchedulerTimelineDndSpec,
    collect
  ),
  connect(mapStateToProps)
)(SchedulerTimeline);
