import React from "react";
import "./PlanListView.css";

export default class PlanListView extends React.Component {
  render() {
    return (
      <div className="PlanListView">
        <div className="PlanListView_ListName">
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
