import "./TechMap.css";
import React from "react";
import { DragSource, DropTarget } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import _ from "lodash";
import classNames from "classnames";

import TechMapTask from "./TechMapTask";

const techMapViewSource = {
  beginDrag(props, monitor, component) {
    return {
      techMapId: props.techMapId,
      colIndex: props.colIndex, // index of source component
      rowIndex: props.rowIndex // index of source component
    }
  }
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
    connectDragPreview: connect.dragPreview()
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
    this.setRef = r => (this.ref = r);
    //console.log('TechMap: constructor: this.props.moveTechMap:', this.props.moveTechMap);
  }
  componentDidMount() {
    // Use empty image as a drag preview so browsers don't draw it
    // and we can draw whatever we want on the custom drag layer instead
    this.props.connectDragPreview(getEmptyImage());
    //console.log('TechMap: componentDidMount: ref: ', this.ref)
  }

  render() {
    const { connectDropTarget, connectDragSource, isDragging } = this.props;
    const techMapStyle = {
      width: this.props.width,
      backgroundColor: this.props.isOver ? "red" : this.props.tintColor,
      left: this.props.left,
      top: this.props.top,
      opacity: isDragging ? 0.3 : 1,
      display: this.props.hidden ? "none" : "block"
    };

    let className = classNames({
      TechMapView: true,
      "TechMapView-isOver": this.props.isOver
    });

    const tasks = _.map(this.props.tasks, t => (
      <TechMapTask
        height={this.props.minsToPixels(t.durationMins)}
        color={t.bgColor}
        name={t.name}
        key={t.id}
      />
    ));

    return connectDropTarget(
      connectDragSource(
        <div className={className} style={techMapStyle} ref={this.setRef}>
          {tasks}
        </div>
      )
    );
  }
}

const techMapDropTargetSpec = {
  // This code utilizes approach taken from dnd card example:
  // https://github.com/react-dnd/react-dnd/blob/master/packages/documentation/examples/04%20Sortable/Simple/Card.tsx
  hover(props, monitor, component) {
    if (!component) {
      return;
    }
    const dragColIndex = monitor.getItem().colIndex;
    const hoverColIndex = props.colIndex;
    const dragRowIndex = monitor.getItem().rowIndex;
    const hoverRowIndex = props.rowIndex;

    // console.log('dragIndex: ' + dragColIndex + ', ' + dragRowIndex)
    // console.log('hoverIndex: ' + hoverColIndex + ', ' + hoverRowIndex)

    // Don't replace items with themselves
    if (dragColIndex === hoverColIndex && dragRowIndex === hoverRowIndex) {
      return;
    }

    if (monitor.isOver() || true) {
      const techMapComponent = component.getDecoratedComponentInstance();
      const targetRect = techMapComponent.ref.getBoundingClientRect();
      //const containerRect = props.getContainerRect();
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - targetRect.top;
      const hoverMiddleY = (targetRect.bottom - targetRect.top) / 2;
      console.log(
        "hoverClientY > hoverMiddleY: " + (hoverClientY > hoverMiddleY)
      );
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      // if (/*dragIndex < hoverIndex &&*/ hoverClientY < hoverClientY) {
      //   return
      // }

      // // Dragging upwards
      // if (/*dragIndex > hoverIndex &&*/ hoverClientY > hoverMiddleY) {
      //   return
      // }
    }

    //props.moveTechMap();
  }
};
function techMapDropCollect(connect, monitor) {
  return {
    canDrop: monitor.canDrop(),
    isOver: monitor.isOver(),
    connectDropTarget: connect.dropTarget()
  };
}
export default _.flow(
  DragSource("techmap", techMapViewSource, collect),
  DropTarget("techmap", techMapDropTargetSpec, techMapDropCollect)
)(TechMap);
