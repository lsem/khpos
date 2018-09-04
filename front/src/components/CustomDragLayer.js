// https://github.com/react-dnd/react-dnd/issues/592

import "./CustomDragLayer.css";
import React from "react";
import PropTypes from "prop-types";
import { DragSource } from "react-dnd";
import { DragLayer } from "react-dnd";
import TechMapView from "./TechMapView";
import TimelinePanelListItem from "./TimelinePanelListItem";

function collect(monitor) {
  return {
    currentOffset: monitor.getSourceClientOffset(),
    clientOffset: monitor.getClientOffset(),
    initialClientOffset: monitor.getInitialClientOffset(),
    diffFromInitialOffset: monitor.getDifferenceFromInitialOffset(),
    isDragging: monitor.isDragging(),
    itemBeingDragged: monitor.getItem(),
    componentType: monitor.getItemType(),
    canDrop: (() => {
      // Seems like it is the only way now to tell if we avobe drop target.
      // Here we inject "artificial" canDrop query to props which allows us
      // to know if draged item is hovering drop target.
      // https://github.com/react-dnd/react-dnd/issues/448
      const targetIds = monitor.isDragging() ? monitor.getTargetIds() : [];
      for (let i = targetIds.length - 1; i >= 0; i--) {
        if (monitor.isOverTarget(targetIds[i])) {
          return monitor.canDropOnTarget(targetIds[i]);
        }
      }
      return false;
    })()
  };
}

function getItemTransform(props) {
  const {
    currentOffset,
    clientOffset,
    initialClientOffset,
    diffFromInitialOffset,
    isDragging,
    itemBeingDragged,
    componentType,
    canDrop
  } = props;
  if (!currentOffset) {
    return {
      display: "none"
    };
  }
  const { x, y } = currentOffset;
  const transform = `translate(${x}px, ${y}px) rotate(0deg)`;

  return {
    zIndex: 100,
    position: "fixed",
    pointerEvents: "none",
    left: 0,
    top: 0,
    transform: transform,
    WebkitTransform: transform
  };
}

class CustomDragLayer extends React.Component {
  renderMaterializedTechMap() {
    return (
      <div className="CustomDragLayer" style={getItemTransform(this.props)}>
        <TechMapView
          title={"Drag layer"}
          tintColor={"grey"}
          height={100}
          left={0}
          width={150}
          top={0}
          key={"Drag layer"}
        />
      </div>
    );
  }
  renderUnmaterializedTechMap() {
    return (
      <div className="CustomDragLayer" style={getItemTransform(this.props)}>
        <TimelinePanelListItem itemDisplayName="Dray layer (panel item)" />
      </div>
    );
  }
  render() {
    const { isDragging, itemBeingDragged, componentType, canDrop } = this.props;
    if (!isDragging) {
      return null;
    }
    if (componentType == "techmap") {
      return this.renderMaterializedTechMap();
    } else if (componentType == "techmap-panel-item") {
      if (canDrop) {
        return this.renderMaterializedTechMap();
      } else {
        return this.renderUnmaterializedTechMap();
      }
    }
  }
}

export default DragLayer(collect)(CustomDragLayer);
