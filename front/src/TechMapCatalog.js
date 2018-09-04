import "./App.css";
import React from "react";
import PropTypes from "prop-types";
import { DragSource } from "react-dnd";
import { DragLayer } from "react-dnd";
import { getEmptyImage } from 'react-dnd-html5-backend';
import CustomDragLayer from "./CustomDragLayer"
import { DragDropContext } from "react-dnd";

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
    const { connectDragPreview, connectDragSource, isDragging } = this.props;
    const style = { backgroundColor: 'green', width: '50%', height: 30};
    return connectDragSource(
      <div className="TechMapCatalogItem" style={style}>
        {this.props.displayName}
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

class TechMapCatalog extends React.Component {
  render() {
    return (
      <div className="TechMapCatalog">
          <CustomDragLayer/>
          <DaggableTechMapCatalogItem displayName="Хліб" />
          <DaggableTechMapCatalogItem displayName="Круасан" />
          <DaggableTechMapCatalogItem displayName="Багет" />
      </div>
    );
  }
}

export default TechMapCatalog;