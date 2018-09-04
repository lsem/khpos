import React from "react";
import "./TimelinePanelListItem.css";

export default class TimelinePanelListItem extends React.Component {
  render() {
    return (
      <ul className="TimelinePanelListItem"> {this.props.itemDisplayName} </ul>
    )
  }
}


