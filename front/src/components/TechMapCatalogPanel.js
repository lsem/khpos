import "../App.css";
import React from "react";
import TimelinePanelListItem from "./TimelinePanelListItem";
import TimelinePanel from "./TimelinePanel";

export default class TechMapCatalogPanel extends React.Component {
  render() {
    const listItems = this.props.techMapRegistry.map(techMap => (
      <TimelinePanelListItem
      itemDisplayName={techMap.name}
      isDraggableItem={true}
      techMapId={techMap.id}
    />

    ));
    return (
      <div className="TechMapCatalogPanel">
        <TimelinePanel listName="Технологічні карти">
        {listItems}
        </TimelinePanel>
      </div>
    );
  }
}
