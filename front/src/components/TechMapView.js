import "./TechMapView.css";
import React from "react";
import { DragSource, DropTarget } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import _ from "lodash";
import classNames from "classnames";
import TechMapViewContent from "./TechMapViewContent";

const techMapViewSource = {
  beginDrag(props, monitor, component) {
    let cb;
    const result = {
      ...props,
      component,
      setQuerySize: x => (cb = x),
      querySize: () => cb()
    };
    return result;
  }
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
    connectDragPreview: connect.dragPreview()
  };
}

class TechMapView extends React.Component {
  componentDidMount() {
    // Use empty image as a drag preview so browsers don't draw it
    // and we can draw whatever we want on the custom drag layer instead
    this.props.connectDragPreview(getEmptyImage());
    this.ref = null;
  }

  render() {
    return this.props.connectDropTarget(
      this.props.connectDragSource(
        <div className="TechMapView">
          <TechMapViewContent {...this.props} ref={r => (this.ref = r)} />
        </div>
      )
    );
  }
}

const techMapDropTargetSpec = {
  hover(props, monitor, component) {
    // todo: not needed anymore?
    if (monitor.isOver()) {
      // const draggedTechMapView = component.getDecoratedComponentInstance();
      // const hoverBoundingRect = draggedTechMapView.nodeRef.getBoundingClientRect();
      //console.log(draggedTechMapView.nodeRef.getBoundingClientRect());
    }
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
)(TechMapView);
