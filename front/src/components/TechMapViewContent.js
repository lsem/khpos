import "./TechMapView.css";
import React from "react";
import _ from "lodash";
import classNames from "classnames";

export default class TechMapViewContent extends React.Component {
  render() {
    const techMapStyle = {
      width: this.props.width,
      height: this.props.height,
      backgroundColor: this.props.tintColor,
      left: this.props.left,
      top: this.props.top,
      // opacity: isDragging ? 0.3 : 1,
      display: this.props.hidden ? "none" : "flex"
    };

    return (
      <div className="TechMapViewContent" style={techMapStyle}>
        {this.props.title}
      </div>
    );
  }
}

