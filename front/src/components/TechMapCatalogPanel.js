import "../App.css";
import React from "react";
import PropTypes from "prop-types";
import { DragSource } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import TimelinePanelListItem from "./TimelinePanelListItem";
import TimelinePanel from "./TimelinePanel";

export default class TechMapCatalogPanel extends React.Component {
  render() {
    return (
      <div className="TechMapCatalogPanel">
        <TimelinePanel listName="Технологічні карти">
          <TimelinePanelListItem itemDisplayName="Хліб" isDraggableItem={true} />
          <TimelinePanelListItem itemDisplayName="Круасан" isDraggableItem={true}/>
          <TimelinePanelListItem itemDisplayName="Багет" isDraggableItem={true}/>
        </TimelinePanel>
      </div>
    );
  }
}
