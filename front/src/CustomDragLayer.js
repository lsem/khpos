import "./App.css";
import React from "react";
import PropTypes from "prop-types";
import { DragSource } from "react-dnd";
import { DragLayer } from "react-dnd";

function collect(monitor) {
  return {
    currentOffset: monitor.getSourceClientOffset(),
    clientOffset: monitor.getClientOffset(),
    initialClientOffset: monitor.getInitialClientOffset(),
    diffFromInitialOffset: monitor.getDifferenceFromInitialOffset(),
    isDragging: monitor.isDragging()
  };
}

function getItemTransform(props) {
  const {
    currentOffset,
    clientOffset,
    initialClientOffset,
    diffFromInitialOffset,
    isDragging
  } = props;
  console.log("currentOffset: ", currentOffset);
  console.log("clientOffset: ", clientOffset);
  console.log("diffFromInitialOffset: ", diffFromInitialOffset);
  console.log("isDragging: ", isDragging);
  if (!currentOffset) {
    return {
      display: "none"
    };
  }

  const { x, y } = currentOffset;
  const transform = `translate(${x}px, ${y}px) rotate(3deg)`;
  return {
    zIndex: 100,
    position: "fixed",
    pointerEvents: 'none',
    left: 0,
    top: 0,
    transform: transform,
    WebkitTransform: transform,
    backgroundColor: "red",
    width: 50,
    height: 50
  };
}

class CustomDragLayer extends React.Component {
  render() {
    const { isDragging } = this.props;
    if (!isDragging) {
      return null;
    }
    return (
      <div className="CustomDragLayer" style={getItemTransform(this.props)} />
    );
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
