import "../App.css";
import React from "react";
import PropTypes from "prop-types";
import { DragSource } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import TimelinePanelListItem from "./TimelinePanelListItem";
import TimelinePanel from "./TimelinePanel";

//https://habr.com/company/macte/blog/344368/

class TechMapCatalogItem extends React.Component {
  componentDidMount() {
    const { connectDragPreview } = this.props;
    // Use empty image as a drag preview so browsers don't draw it
    // and we can draw whatever we want on the custom drag layer instead
    connectDragPreview(getEmptyImage());
  }
  constructor(props) {
    super(props);
  }
  render() {
    const { connectDragSource } = this.props;
    const style = { height: 30 };
    return connectDragSource(
      <div className="TechMapCatalogItem" style={style}>
        <li>{this.props.displayName}</li>
      </div>
    );
  }
}

const techMapCatalogItemSource = {
  beginDrag(props) {
    return {};
  }
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
    connectDragPreview: connect.dragPreview()
  };
}

TechMapCatalogItem.propTypes = {
  connectDragSource: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired,
  connectDragPreview: PropTypes.func.isRequired
};
const DaggableTechMapCatalogItem = DragSource(
  "techmap",
  techMapCatalogItemSource,
  collect
)(TechMapCatalogItem);

export default class TechMapCatalogPanel extends React.Component {
  render() {
    return (
      <div className="TechMapCatalogPanel">
        <TimelinePanel listName="Технологічні карти">
          <TimelinePanelListItem itemDisplayName="Хліб" />
          <TimelinePanelListItem itemDisplayName="Круасан" />
          <TimelinePanelListItem itemDisplayName="Багет" />
        </TimelinePanel>
      </div>
    );
  }
}
