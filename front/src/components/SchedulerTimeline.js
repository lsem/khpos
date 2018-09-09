import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import classNames from "classnames";
import { DropTarget } from "react-dnd";
import TechMapView from "./TechMapView";
import { autoLayout } from "../helpers/layout";
import _ from "lodash";
import "./SchedulerTimeline.css";

function getSampleJobs() {
  return [
    {
      title: "1",
      tintColor: "rgb(216, 216, 216)",
      durationHours: 2.5,
      startTime: Date.parse("01 Jan 1970 00:30:00 GMT"),
      id: "1"
    },
    {
      title: "2",
      tintColor: "rgb(216, 216, 216)",
      durationHours: 1.5,
      startTime: Date.parse("01 Jan 1970 02:00:00 GMT"),
      id: "2"
    },
    {
      title: "3",
      tintColor: "rgb(216, 216, 216)",
      durationHours: 3.5,
      startTime: Date.parse("01 Jan 1970 01:00:00 GMT"),
      id: "3"
    },
    {
      title: "4",
      tintColor: "rgb(216, 216, 216)",
      durationHours: 0.7,
      startTime: Date.parse("01 Jan 1970 1:30:00 GMT"),
      id: "4"
    },
    {
      title: "5",
      tintColor: "rgb(216, 216, 216)",
      durationHours: 0.7,
      startTime: Date.parse("01 Jan 1970 6:30:00 GMT"),
      id: "5"
    },
    {
      title: "6",
      tintColor: "rgb(216, 216, 216)",
      durationHours: 0.4,
      startTime: Date.parse("01 Jan 1970 7:00:00 GMT"),
      id: "6"
    },
    {
      title: "7",
      tintColor: "rgb(216, 216, 216)",
      durationHours: 1.2,
      startTime: Date.parse("01 Jan 1970 7:35:00 GMT"),
      id: "7"
    },
    {
      title: "8",
      tintColor: "rgb(216, 216, 216)",
      durationHours: 1.2,
      startTime: Date.parse("01 Jan 1970 6:30:00 GMT"),
      id: "8"
    },
    {
      title: "9",
      tintColor: "rgb(216, 216, 216)",
      durationHours: 1.2,
      startTime: Date.parse("01 Jan 1970 7:00:00 GMT"),
      id: "9"
    },
    {
      title: "10",
      tintColor: "rgb(216, 216, 216)",
      durationHours: 1.2,
      startTime: Date.parse("01 Jan 1970 7:30:00 GMT"),
      id: "10"
    },
    {
      // On this example we can see the fact that views are not
      // clipped.
      title: "11",
      tintColor: "rgb(216, 216, 216)",
      durationHours: 4.0,
      startTime: Date.parse("01 Jan 1970 23:00:00 GMT"),
      id: "11"
    }
  ];
}

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
    if (!monitor.isOver()) {
      return;
    }
    if (!monitor.canDrop()) return;
    // TODO: Why this does not work? it must be working.
    //const timeLine = component.getDecoratedComponentInstance();
    if (component.state.dndState === "over") {
      if (component.state.draggedLayerOffset !== monitor.getClientOffset()) {
        const newState = Object.assign({}, component.state, {
          // todo: check, client should already have this offset
          draggedLayerOffset: monitor.getClientOffset()
        });
        component.setStateDebouncedHighRate(newState);
      }
    } else {
      console.log("SchedulerTimeline: hover: not over; do nothing");
    }
  }
};

class SchedulerTimeline extends React.Component {
  // https://stackoverflow.com/questions/23123138/perform-debounce-in-react-js
  setStateDebouncedHighRate = _.debounce(s => this.setState(s), 10);
  setStateDebouncedLowRate = _.debounce(s => this.setState(s), 100);

  constructor(props) {
    super(props);
    this.selfBoundingRect = null;
    this.setRef = el => (this.ref = el);
    this.state = {
      jobs: getSampleJobs(),
      dndState: "out",
      dragLayerRect: null,
      draggedLayerOffset: 0,
      scrollTop: 0
    };
    this.frameNum = 0;
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

  componentWillReceiveProps(nextProps) {
    if (!this.props.isOver && nextProps.isOver) {
      console.log("SchedulerTimeline: Drag layer entered");
      // Now we can query size of rect and update own state accordingly
      const dragLayerrect = nextProps.item.querySize();
      this.setState({
        dndState: "over",
        dragLayerRect: {
          width: dragLayerrect.width,
          height: dragLayerrect.height,
          top: dragLayerrect.top,
          left: dragLayerrect.left
        }
      });
    }

    if (this.props.isOver && !nextProps.isOver) {
      console.log("SchedulerTimeline: Drag layer left");
      this.setState({
        dndState: "out",
        dragLayerRect: null
      });
    }

    if (this.props.isOverCurrent && !nextProps.isOverCurrent) {
      // You can be more specific and track enter/leave
      // shallowly, not including nested targets
    }
  }

  getDraggedViewRect() {
    console.assert(this.state.dndState === "over");
    if (this.state.dndState !== "over") {
      return null;
    }
    // Returns a rect to indicate we have access
    // to correct dragged layer dimensions to be able to communicate
    // user drop position via UI. Rect is translated to SchedulerTimeline
    // rect area.
    const dragRect = this.state.dragLayerRect;
    const diffX =
      this.props.initialSourceClientOffset.x - this.props.initialClientOffset.x;
    const diffY =
      this.props.initialSourceClientOffset.y - this.props.initialClientOffset.y;
    dragRect.left = this.state.draggedLayerOffset.x + diffX;
    dragRect.top = this.state.draggedLayerOffset.y + diffY;
    return {
      left: dragRect.left - this.selfBoundingRect.left,
      top: dragRect.top - this.selfBoundingRect.top + this.state.scrollTop,
      width: dragRect.width,
      height: dragRect.height
    };
  }

  render() {
    const msToHours = ms => ms / (1000 * 60 * 60);
    const hoursToMs = h => h * 1000 * 60 * 60;
    const msToPixels = ms => msToHours(ms) * this.props.durationScalingFator;
    const jobHeight = j => msToPixels(hoursToMs(j.durationHours));
    const jobTop = j => msToPixels(j.startTime - this.props.beginTime);

    const jobLayoutMapper = {
      vbegin: x => x.startTime,
      vend: x => x.startTime + hoursToMs(x.durationHours),
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
      const columnTechMaps = columnJobs.map((job, idx) => (
        <TechMapView
          title={job.title}
          tintColor={job.tintColor}
          height={jobHeight(job)}
          left={0}
          width={this.props.jobWidth}
          top={jobTop(job)}
          key={job.id}
        />
      ));
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
      // Dirty fix of problem that sometimes rendering is performing
      // with state == 'over' but initialSourceClientOffset
      // or/and initialClientOffset not available
      const dirtyFixConditions =
        !this.props.initialSourceClientOffset ||
        !this.props.initialClientOffset;
      if (this.state.dndState === "over" && dirtyFixConditions) {
        console.warn("WARNING: SchedulerTimeline: dirtyFixConditions");
      }
      if (
        this.state.dndState !== "over" ||
        !this.state.draggedLayerOffset ||
        dirtyFixConditions
      ) {
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

export default DropTarget(
  ["techmap", "techmap-panel-item"],
  SchedulerTimelineDndSpec,
  collect
)(SchedulerTimeline);
