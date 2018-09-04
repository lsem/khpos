// https://github.com/react-dnd/react-dnd/issues/592

import "./CustomDragLayer.css";
import React from "react";
import PropTypes from "prop-types";
import { DragSource } from "react-dnd";
import { DragLayer } from "react-dnd";
import TechMapView from "./TechMapView";

let updates = 0;
function collect(monitor) {
  if (updates++ % 1 === 0) {
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
  } else {
    return {};
  }
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
  // console.log("currentOffset: ", currentOffset);
  // console.log("clientOffset: ", clientOffset);
  // console.log("diffFromInitialOffset: ", diffFromInitialOffset);
  // console.log("isDragging: ", isDragging);
  // console.log("itemBeingDragged: ", itemBeingDragged);
  // console.log("componentType: ", componentType);
  // console.log("!!!!!!! canDrop !!!!!!!: ", canDrop);
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

class CustomDragLayer extends React.PureComponent {
  render() {
    const { isDragging, itemBeingDragged, componentType, canDrop } = this.props;
    if (!isDragging) {
      return null;
    }
    if (componentType == "techmap") {
      if (canDrop) {
        // Materialized TechMapView
        const style = Object.assign({}, getItemTransform(this.props), {
          //backgroundColor: "black",
          // width: 50,
          // height: 50
        });
        console.log('CAN DROP!')

        return (
          <div className="CustomDragLayer" style={style}>
            <TechMapView
              title={"New one"}
              tintColor={"grey"}
              height={100}
              left={0}
              width={150}
              top={0}
              key={"New one"}
            />
            ));
          </div>
        );
      } else {
        // Regular view, not TechMapView yet.
        console.log('CANNOT DROP')
        const style = Object.assign({}, getItemTransform(this.props), {
          backgroundColor: "red",
          width: 50,
          height: 50
        });
        return <div className="CustomDragLayer" style={style} />;
      }
    }
  }
}
CustomDragLayer.propTypes = {
  isDragging: PropTypes.bool.isRequired,
  currentOffset: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired
  })
};

export default DragLayer(collect)(CustomDragLayer);
