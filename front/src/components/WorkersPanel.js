import React from "react";
import "./WorkersPanel.css";
import TimelinePanelListItem from "./TimelinePanelListItem";
import TimelinePanel from './TimelinePanel';

export default class WorkersPanel extends React.Component {
  render() {
    return (
      <div className="WorkersPanel">
        <TimelinePanel listName="Працівники">
          <TimelinePanelListItem itemDisplayName="Аня" />
          <TimelinePanelListItem itemDisplayName="Вітя" />
          <TimelinePanelListItem itemDisplayName="Настя" />
        </TimelinePanel>
      </div>
    );
  }
}
