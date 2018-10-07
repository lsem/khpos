import "../App.css";
import React from "react";
import PlanTechMapListItem from "./PlanTechMapListItem";
import ListView from "./ListView";
import Icon from "./Icon";
import { ICONS } from "../constants/icons";
import "./PlanTechMapsMenu.css";

export default class PlanTechMapsMenu extends React.Component {
  componentDidMount() {
    this.props.requestTechMaps();
  }

  render() {
    return (
      <div className="planTechMapsMenu">
        <div className="planTechMapsMenuHeader">
          <Icon icon={ICONS.RECIEPTS} size={16} color="#7F7F7F" />
          <h6>Технологічні карти</h6>
        </div>
        <ListView>
          {this.props.techMaps.map(techMap => (
            <PlanTechMapListItem
              itemDisplayName={techMap.name}
              isDraggableItem={true}
              techMapId={techMap.id}
              key={techMap.id}
            />
          ))}
        </ListView>
        <div className="planTechMapsAddButton">
          <Icon icon={ICONS.ADD} size={16} color="#007aff" />
          {" Додати "}
        </div>
      </div>
    );
  }
}
