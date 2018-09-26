import "./TechMap.css";
import React from "react";
import { DragSource, DropTarget } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import _ from "lodash";
import classNames from "classnames";
import DragItemTypes from "../dragItemTypes";
import TechMapTask from "./TechMapTask";

const techMapViewSource = {
  beginDrag(props, monitor, component) {
    return {
      techMapId: props.techMapId,
      jobId: props.jobId,
      colIndex: props.colIndex, // index of source component
      rowIndex: props.rowIndex // index of source component
    };
  }
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
    connectDragPreview: connect.dragPreview(),
    itemType: monitor.getItemType()
  };
}

class TechMap extends React.Component {
  static calcHeight(props, minsToPixels) {
    const tasksMinutes = _.map(props.tasks, t => t.durationMins);
    const total = _.reduce(tasksMinutes, (x, sum) => x + sum, 0);
    return minsToPixels(total);
  }

  constructor(props) {
    super(props);
    this.ref = null;
    this.setRef = this.setRef.bind(this);
    //console.log('TechMap: constructor: this.props.moveTechMap:', this.props.moveTechMap);
  }

  setRef(ref) {
    this.ref = ref;
    // forward ref up
    this.props.innerRef(ref);
  }

  componentDidMount() {
    // Use empty image as a drag preview so browsers don't draw it
    // and we can draw whatever we want on the custom drag layer instead
    this.props.connectDragPreview(getEmptyImage());
  }

  render() {
    const { connectDropTarget, connectDragSource, isDragging } = this.props;
    const techMapStyle = {
      width: this.props.width,
      backgroundColor: this.props.isOver ? "red" : this.props.tintColor,
      left: this.props.left,
      top: this.props.top,
      opacity: isDragging ? 0.2 : 1,
      display: this.props.hidden ? "none" : "block"
    };

    let className = classNames({
      TechMapView: true,
      "TechMapView-isOver": this.props.isOver
    });

    const tasks = _.map(this.props.tasks, t => (
      <TechMapTask
        height={this.props.minsToPixels(t.durationMins)}
        task={t}
        key={t.id}
      />
    ));

    return connectDragSource(
      <div className={className} style={techMapStyle} ref={this.setRef}>
        {tasks}
      </div>
    );
  }
}

export default _.flow(
  DragSource(DragItemTypes.TIMELINE_TECHMAP, techMapViewSource, collect)
)(TechMap);
