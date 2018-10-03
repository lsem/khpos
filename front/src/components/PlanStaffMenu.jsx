import React from "react";
import PlanStaffListItem from "./PlanStaffListItem"
import PlanListView from './PlanListView';
import { ICONS } from "../constants/icons";

export default class PlanStaffMenu extends React.Component {
  
  componentDidMount() {
    this.props.requestStaff();
  }
  
  render() {
    return (
        <PlanListView icon={ICONS.PEOPLE} listName="Працівники">
          {
            this.props.staff.map(worker => (
              <PlanStaffListItem worker={worker} key={worker.id}/>
            ))
          }
        </PlanListView>
    );
  }
}
