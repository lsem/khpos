import "../App.css";
import React from "react";
import TimelinePanelListItem from "./TimelinePanelListItem";
import TimelinePanel from "./TimelinePanel";
import { connect } from "react-redux";

class TechMapCatalogPanel extends React.Component {
  render() {
    const techMapsList = this.props.techMapsTimeLine.map(techMap => (
      <TimelinePanelListItem
        itemDisplayName={techMap.title}
        isDraggableItem={true}
        onDndDragBegin={this.props.onDndDragBegin}
        queryTechMapHeight={this.props.queryTechMapHeight}
        techMapId={techMap.id}
        isHover={this.props.isHover}
      />
    ));

    return (
      <div className="TechMapCatalogPanel">
        <TimelinePanel listName="Технологічні карти">
          {techMapsList}
        </TimelinePanel>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    techMapsTimeLine: state.techMapsTimeLine
  };
};

export default connect(mapStateToProps)(TechMapCatalogPanel);
