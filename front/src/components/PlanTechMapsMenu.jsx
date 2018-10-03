import "../App.css";
import React from "react";
import TimelinePanelListItem from "./PlanListItem";
import PlanListView from "./PlanListView";
import { ICONS } from "../constants/icons";

export default class PlanTechMapsMenu extends React.Component {
  componentDidMount() {
    this.props.requestTechMaps();
  }

  render() {
    const listItems = this.props.techMaps.map((techMap, idx) => (
      <TimelinePanelListItem
      key={idx}
      itemDisplayName={techMap.name}
      isDraggableItem={true}
      techMapId={techMap.id}
    />

    ));
    return (
        <PlanListView icon={ICONS.RECIEPTS} listName="Технологічні карти">
            {listItems}
        </PlanListView>
    );
  }
}
