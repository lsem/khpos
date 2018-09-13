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

const DndStateName = {
  IN: "IN",
  OUT: "OUT"
};

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
    if (component.state.dndState === DndStateName.IN) {
      if (component.state.draggedLayerOffset !== monitor.getClientOffset()) {
        component.setStateDebouncedHighRate({
        //component.setState({
          draggedLayerOffset: monitor.getClientOffset()
        });
      }
    } else {
      //console.log("SchedulerTimeline: hover: not over; do nothing");
    }
  }
};

class SchedulerTimeline extends React.Component {
  // https://stackoverflow.com/questions/23123138/perform-debounce-in-react-js
  setStateDebouncedHighRate = _.debounce(s => this.setState(s), 3);
  setStateDebouncedLowRate = _.debounce(s => this.setState(s), 100);

  constructor(props) {
    super(props);
    this.selfBoundingRect = null;
    this.setRef = el => (this.ref = el);
    this.state = {
      jobs: props.techMapsTimeLine,
      dndState: DndStateName.OUT,
      dragLayerRect: null,
      draggedLayerOffset: { x: -1, y: -1 },
      scrollTop: 0
    };
    this.frameNum = 0;
    this.moveTechMap = this.moveTechMap.bind(this);
    this.getContainerRect = this.getContainerRect.bind(this);
  }

  getContainerRect() {
    return this.ref.getBoundingClientRect();
  }

  moveTechMap() {
    console.log('SchedulerTimeline: moveTechMap()');
  }

  // When component did mount we can access DOM.
  // https://twitter.com/dan_abramov/status/981712092611989509
  componentDidMount() {
    // Query own bounding rect, not part of state
    console.assert(this.ref);
    const rect = this.ref.getBoundingClientRect();
    this.selfBoundingRect = {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom
    };
    // subscribe to scroll updates to make scroll position part of state
    this.ref.addEventListener("scroll", e => {
      this.setStateDebouncedLowRate({ scrollTop: this.ref.scrollTop });
    });
  }


  // TODO: Will be removed recently.
  componentWillReceiveProps(nextProps) {
    // TODO: Find other place to do this logic.
    //  Changing state in this method is not recommended,
    //  and that is why we can sometimes observe different inconsistencies.
    // https://reactjs.org/docs/react-component.html#unsafe_componentwillreceiveprops
    // https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html
    if (!this.props.isOver && nextProps.isOver) {
      this.props.onTechMapPreviewEnteredTimeline()
    }
    if (this.props.isOver && !nextProps.isOver) {
      this.props.onTechMapPreviewLeftTimeline()
    }

    if (this.props.isOverCurrent && !nextProps.isOverCurrent) {
      // You can be more specific and track enter/leave
      // shallowly, not including nested targets
    }
  }

  getDraggedViewRect() {
    console.assert(this.state.dndState === DndStateName.IN);
    if (this.state.dndState !== DndStateName.IN) {
      return null;
    }
    // Returns a rect to indicate we have access
    // to correct dragged layer dimensions to be able to communicate
    // user drop position via UI. Rect is translated to SchedulerTimeline
    // rect area.
    const dragRect = this.state.dragLayerRect;
    dragRect.left = this.state.draggedLayerOffset.x + this.state.diffX;
    dragRect.top = this.state.draggedLayerOffset.y + this.state.diffY;
    return {
      left: dragRect.left - this.selfBoundingRect.left,
      top: dragRect.top - this.selfBoundingRect.top + this.state.scrollTop,
      width: dragRect.width,
      height: dragRect.height
    };
  }

  render() {
    const minutesToMs = min => min * 1000 * 60;
    const msToMins = ms => ms / (1000 * 60);
    const msToPixels = ms => this.props.minsToPixels(msToMins(ms))
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
      //co  nsole.log("columnJobIds: ", columnJobIds);
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
      )});
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
      if (this.state.dndState !== DndStateName.IN) {
        // Rendering of scene without drag layer tracking
        return (
          <div className={className} style={style} ref={this.setRef}>
            {columnViews}
          </div>
        );
      }

      const draggedViewRect = this.getDraggedViewRect();
      const topLineY = draggedViewRect.top + draggedViewRect.height - 1;
      const bottomLineY = draggedViewRect.top;
      const leftLineX = draggedViewRect.left;
      const rightLineX = draggedViewRect.left + draggedViewRect.width - 1;
      const hLineStyle = top => {
        return {
          position: "absolute",
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          width: this.props.width,
          height: 1,
          left: 0,
          top: top
        };
      };

      const vLineStyle = left => {
        return {
          position: "absolute",
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          width: 1,
          height: this.props.height,
          left: left,
          top: this.state.scrollTop
        };
      };
      return (
        <div className={className} style={style} ref={this.setRef}>
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

const mapStateToProps = (state) => {
  return {
    techMapsTimeLine: state.techMapsTimeLine,
    techMapTasks: state.techMapTasks
  }
}

export default _.flow(
  DropTarget(
  ["techmap", "techmap-panel-item"],
  SchedulerTimelineDndSpec,
  collect
  ),
  connect(mapStateToProps)
)(SchedulerTimeline);
