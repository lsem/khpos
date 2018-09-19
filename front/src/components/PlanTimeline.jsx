import React from "react";
import moment from "moment";
import classNames from "classnames";
import { DropTarget } from "react-dnd";
import TechMapView from "./TechMap";
import _ from "lodash";
import "./PlanTimeline.css";

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
    // In this method drop handling is basically happens.
    // Apart from that this hover() is the only method that
    // receives constant flow of mouse move events in react-dnd design
    // so we propagate this events to master component to hightlight current time
    // on PlanTimeline which are passed as props to it.
    if (!monitor.isOver()) return;
    if (!monitor.canDrop()) return;

    // component is instance of PlanTimeline, we pass information to there
    // where it then be delivered to parent which knows entire picture and can
    // change PlanTimeline accordingly.
    component.onOffsetChanged(
      monitor.getClientOffset(),
      monitor.getDifferenceFromInitialOffset(),
      monitor.getInitialClientOffset()
    );
  }
};

class PlanTimeline extends React.Component {
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
    this.frameNum = 0;
    this.moveTechMap = this.moveTechMap.bind(this);
  }

  moveTechMap() {
    console.log("PlanTimeline: moveTechMap()");
  }

  columnDomAttached(column, ref) {
    if (ref) {
      this.props.columnAttached(column, ref.getBoundingClientRect());
    } else {
      this.props.columnDetached(column);
    }
  }

  techMapDomAttached(techMapId, jobId, column, row, ref) {
    if (ref) {
      this.props.techMapAttached(
        techMapId,
        jobId,
        ref.getBoundingClientRect(),
        column,
        row
      );
    } else {
      this.props.techMapDetached(techMapId);
    }
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
      this.props.onTechMapPreviewEnteredTimeline(nextProps.item, {
        x: diffX,
        y: diffY
      });
    }
    if (this.props.isOver && !nextProps.isOver) {
      this.props.onTechMapPreviewLeftTimeline();
    }

    if (this.props.isOverCurrent && !nextProps.isOverCurrent) {
      // You can be more specific and track enter/leave
      // shallowly, not including nested targets
    }
  }

  renderHover() {
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
        left: this.props.scrollLeft,
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
      <div>
        <div style={hLineStyle(topLineY)} />
        <div style={hLineStyle(bottomLineY)} />
        <div style={vLineStyle(leftLineX)} />
        <div style={vLineStyle(rightLineX)} />
      </div>
    );
  }

  renderColumns() {
    // todo: in current design, we have only those columns which
    // have some tasks but in general, we need to create also
    // placeholder colums. I would like to see this on data level
    // so that this component has no this logic whatsoever.
    // On the flip side, I would like to be able to create not more
    // columns that fit into this component.
    // We can consider employing logic when this component reports
    // columns count it can render without horizontal scolling (or may be more).
    const msToMins = ms => ms / (1000 * 60);
    const jobDuration = j => j.startTime - this.props.beginTime;
    const jobTop = j => this.props.minsToPixels(msToMins(jobDuration(j)));
    const jobsByCols = _.groupBy(this.props.jobs, job => job.column);
    return _.keys(jobsByCols).map(column => {
      const columnTechMaps = jobsByCols[column].map((job, rowIndex) => (
        <TechMapView
          // TODO: WARNING: this refers to techMapId but in fact it should not,
          // because it will be inconsistent at some moment with currently
          // available tech maps registry
          techMapId={job.techMap.id}
          jobId={job.id}
          title={job.techMap.name}
          tintColor={job.techMap.tintColor}
          minsToPixels={this.props.minsToPixels}
          left={0}
          width={this.props.jobWidth}
          top={jobTop(job)}
          key={job.id}
          moveTechMap={this.moveTechMap}
          getContainerRect={this.getContainerRect}
          colIndex={column}
          rowIndex={rowIndex}
          tasks={job.techMap.tasks}
          innerRef={this.techMapDomAttached.bind(
            this,
            job.techMap.id,
            job.id,
            column,
            rowIndex
          )}
        />
      ));
      const columnStyle = {
        left: column * (this.props.jobWidth + 10),
        width: this.props.jobWidth,
        height: this.props.minsToPixels(
          msToMins(this.props.endTime - this.props.beginTime)
        )
      };
      return (
        <div
          className="PlanTimelineColumn"
          style={columnStyle}
          key={column}
          ref={this.columnDomAttached.bind(this, column)}
        >
          {columnTechMaps}
        </div>
      );
    });
  }

  render() {
    // console.log("PlanTimeline: frame: ", this.frameNum++);
    let className = classNames({
      PlanTimeline: true,
      "PlanTimeline--highlighted": this.props.canDrop,
      "PlanTimeline--hovered": this.props.isOver
    });

    // Note, to connect to react-dnd drop target this must return native element (div)
    return this.props.connectDropTarget(
      <div
        className={className}
        ref={this.props.onSchedulerTimelineDomNodeRefUpdate}
      >
        {this.renderColumns()}
        {this.props.presentTechMapHover ? this.renderHover() : null}
      </div>
    );
  }
}

export default DropTarget(
  ["techmap", "techmap-panel-item"],
  SchedulerTimelineDndSpec,
  collect
)(PlanTimeline);
