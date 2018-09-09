import "./TechMapView.css";
import React from "react";
import { DragSource, DropTarget } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import _ from "lodash";
import classNames from "classnames";

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
    this.nodeRef = null;
  }

  render() {
    const { connectDropTarget, connectDragSource, isDragging } = this.props;
    const techMapStyle = {
      width: this.props.width,
      height: this.props.height,
      backgroundColor: this.props.isOver ? "red" : this.props.tintColor,
      left: this.props.left,
      top: this.props.top,
      opacity: isDragging ? 0.3 : 1,
      display: this.props.hidden ? "none" : "flex"
    };

    let className = classNames({
      TechMapView: true,
      "TechMapView-isOver": this.props.isOver
    });

    return connectDropTarget(
      connectDragSource(
        <div
          className={className}
          style={techMapStyle}
          ref={x => {
            this.nodeRef = x;
          }}
        >
          {this.props.title}
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
