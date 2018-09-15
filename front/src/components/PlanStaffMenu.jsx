import React from "react";
import TimelinePanelListItem from "./PlanListItem";
import PlanListView from './PlanListView';

export default class PlanStaffMenu extends React.Component {
  render() {
    return (
        <PlanListView listName="Працівники">
          <TimelinePanelListItem itemDisplayName="Аня" />
          <TimelinePanelListItem itemDisplayName="Вітя" />
          <TimelinePanelListItem itemDisplayName="Настя" />
        </PlanListView>
    );
  }
}
