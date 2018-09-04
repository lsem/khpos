import "./TechMapView.css";
import React from "react";
import PropTypes from "prop-types";
import { DragSource } from "react-dnd";
import { getEmptyImage } from 'react-dnd-html5-backend';

const techMapViewSource = {
  beginDrag(props) {
    return props;
  }
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
    connectDragPreview: connect.dragPreview(),
  };
}

class TechMapView extends React.Component {
  componentDidMount() {
    // Use empty image as a drag preview so browsers don't draw it
    // and we can draw whatever we want on the custom drag layer instead
    this.props.connectDragPreview(getEmptyImage());
  }

  render() {
    const { connectDragSource, isDragging} = this.props;
    const techMapStyle = {
      width: this.props.width ,
      height: this.props.height,
      backgroundColor: this.props.tintColor,
      left: this.props.left,
      top: this.props.top,
      opacity: isDragging ? 0.5 : 1
    };
    return connectDragSource(
      <div className="TechMapView" style={techMapStyle}>
        {this.props.title}
      </div>
    );
  }
}

export default DragSource("techmap", techMapViewSource, collect)(TechMapView);
