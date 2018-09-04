import "./TechMapView.css";
import React from "react";
import PropTypes from "prop-types";
import { DragSource } from "react-dnd";
import { getEmptyImage } from 'react-dnd-html5-backend';

const techMapViewSource = {
  beginDrag(props) {
    return {}
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
    const { connectDragPreview } = this.props;
    // Use empty image as a drag preview so browsers don't draw it
    // and we can draw whatever we want on the custom drag layer instead
    connectDragPreview(getEmptyImage());
  }

  render() {
    const { connectDragSource, isDragging} = this.props;
    const techMapStyle = {
      width: this.props.width + "px",
      height: this.props.height + "px",
      backgroundColor: this.props.tintColor,
      left: this.props.left + "px",
      top: this.props.top + "px",
      opacity: isDragging ? 0.5 : 1
    };
    return connectDragSource(
      <div className="TechMapView" style={techMapStyle}>
        {this.props.title}
      </div>
    );
  }
}

TechMapView.propTypes = {
  connectDragSource: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired
};

//
export default DragSource("techmap", techMapViewSource, collect)(TechMapView);
//export default TechMapView;
