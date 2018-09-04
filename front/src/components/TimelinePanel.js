import React from "react";
import "./TimelinePanel.css";

export default class TimelinePanel extends React.Component {
  render() {
    return (
      <div className="TimelinePanel">
        <div className="TimelinePanel_ListName">
          {this.props.listName}
        </div>
        <ul>
          {this.props.children}
        </ul>
        <div className="AddButton">
          {"+ Додати "}
        </div>
      </div>
    );
  }
}
