import "./PlanListItem.css";
import React from "react";
import { DragSource } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

class PlanListItem extends React.Component {
  // Needed for react-dnd
  componentDidMount() {
    // Use empty image as a drag preview so browsers don't draw it
    // and we can draw whatever we want on the custom drag layer instead
    this.props.connectDragPreview(getEmptyImage());
  }
  render() {
    const style = {
      opacity: this.props.isDragging ? 0 : 1 // todo: seems like this not neded, but needs to be checked
    };
    // TODO: refactor this (consider having identity decorator).
    if (this.props.isDraggableItem) {
      return this.props.connectDragSource(
        <ul className="PlanListItem" style={style}>
          {this.props.itemDisplayName}
        </ul>
      );
    } else {
      return (
        <ul className="PlanListItem" style={style}>
          {this.props.itemDisplayName}
        </ul>
      );
    }
  }
}

// Needed for react-dnd
export default DragSource(
  "techmap-panel-item",
  // source:
  {
    beginDrag(props, monitor, component) {
      return {
        techMapId: props.techMapId
      };
    }
  }, // collect:
  (connect, monitor) => {
    return {
      connectDragSource: connect.dragSource(),
      isDragging: monitor.isDragging(),
      connectDragPreview: connect.dragPreview()
    };
  }
)(PlanListItem);
