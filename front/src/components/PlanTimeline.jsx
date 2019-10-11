import React from "react";
import classNames from "classnames";
import { DropTarget } from "react-dnd";
import PlanJobView from "./PlanJobView";
import _ from "lodash";
import "./PlanTimeline.css";
import DragItemTypes from "../dragItemTypes";
import moment from "moment";

const msToMins = ms => ms / (1000 * 60);

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
  drop(props, monitor, component) {
    component.props.onDrop(monitor.getItem());
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
    1000 / 60 /*in combination with throttling must yield to X fps*/
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
        width: "100%",
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
        height: "100%",
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

  getColumnsTechmaps() {
    const jobsByCols = _.groupBy(this.props.jobs, job => job.column);
    // generate empty columns for which we have no data yet.
    const availableColumns = _.map(this.props.jobs, job => job.column);
    // WARNING: for some reason without Number it results in stirng contact, e.g. '8' + 2 = '82'
    const maxColumn = _.max([7, Number(_.max(availableColumns)) + 2]);
    for (let i = 0; i < maxColumn; ++i) {
      jobsByCols[i] = jobsByCols[i] || [];
    }
    return jobsByCols;
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
    const jobDuration = j =>
      moment(j.startTime).valueOf() - moment(this.props.beginTime).valueOf();
    const jobTop = j => this.props.minsToPixels(msToMins(jobDuration(j)));
    const jobsByCols = this.getColumnsTechmaps();
    return _.keys(jobsByCols).map(column => {
      const columnTechMaps = jobsByCols[column].map((job, rowIndex) => (
        <PlanJobView
          // TODO: WARNING: this refers to techMapId but in fact it should not,
          // because it will be inconsistent at some moment with currently
          // available tech maps registry
          job={job}
          techMap={this.props.techMaps.find(
            tm =>
              tm.id === job.techMap.id && tm.version === job.techMap.version
          )}
          employees={this.props.employees}
          minsToPixels={this.props.minsToPixels}
          left={0}
          width={this.props.jobWidth}
          top={jobTop(job)}
          key={job.id}
          moveTechMap={this.moveTechMap}
          getContainerRect={this.getContainerRect}
          colIndex={column}
          rowIndex={rowIndex}
          innerRef={this.techMapDomAttached.bind(
            this,
            job.techMap.id,
            job.id,
            column,
            rowIndex
          )}
          handleJobTaskAssign={this.props.handleJobTaskAssign}
        />
      ));
      const columnStyle = {
        width: this.props.jobWidth,
        height: this.props.minsToPixels(
          msToMins(this.props.endTime - this.props.beginTime)
        )
      };
      let className = classNames({
        PlanTimelineColumn: true,
        "PlanTimelineColumn--isover": this.props.canDrop,
        "PlanTimelineColumn--hovered": column === this.props.hoverColumn
      });
      return (
        <div
          className={className}
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
        {this.props.presentTechMapHover && false ? this.renderHover() : null}
      </div>
    );
  }
}

export default DropTarget(
  [DragItemTypes.TIMELINE_TECHMAP, DragItemTypes.SIDEBAR_TECHMAP],
  SchedulerTimelineDndSpec,
  collect
)(PlanTimeline);
