import React from "react";
import "./PlanListView.css";
import Icon from "./Icon";
import { ICONS } from "../constants/icons";

export default class PlanListView extends React.Component {
  render() {
    return (
      <div className="PlanListView">
        <div className="PlanListView_ListName">
          <Icon 
            icon={this.props.icon}
            size={16}
            color="#7F7F7F"/>
          {" "}{this.props.listName}
        </div>
        <ul>
          {this.props.children}
        </ul>
        <div className="AddButton">
          <Icon 
            icon={ICONS.ADD}
            size={16}
            color="#007aff"/>
          {" Додати "}
        </div>
      </div>
    );
  }
}
