import "./PlanTechMapListItem.css";
import React from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import { DragSource } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import DragItemTypes from "../dragItemTypes";
import Icon from "./Icon";
import { ICONS } from "../constants/icons";
import { ROUTES } from "../constants/routes";

class PlanListItem extends React.Component {
  // Needed for react-dnd
  componentDidMount() {
    // Use empty image as a drag preview so browsers don't draw it
    // and we can draw whatever we want on the custom drag layer instead
    this.props.connectDragPreview(getEmptyImage());
  }

  render() {
    const style = {
      opacity: this.props.isDragging ? 0.7 : 1
    };

    const classes = classNames("planTechMapListItem", {
      planTechMapListItemSelected: this.props.selected
    });
    // TODO: refactor this (consider having identity decorator).

    const li = (
      <li onClick={this.props.onClick} className={classes} style={style}>
        <span>{this.props.itemDisplayName}</span>
        <Link
          to={`${ROUTES.EDIT_TECH_MAP}/${this.props.techMapId}`}
          className="planTechMapListItemEditButton"
          onClick={this.renameClick}
        >
          <Icon icon={ICONS.EDIT} size={16} />
        </Link>
      </li>
    );

    if (this.props.isDraggableItem) {
      return this.props.connectDragSource(li);
    } else {
      return li;
    }
  }
}

// Needed for react-dnd
export default DragSource(
  DragItemTypes.SIDEBAR_TECHMAP,
  // source:
  {
    beginDrag(props, monitor, component) {
      return {
        techMapId: props.techMapId
      };
    }
  }, // collect:
  (connect, monitor) => {
    return {
      connectDragSource: connect.dragSource(),
      isDragging: monitor.isDragging(),
      connectDragPreview: connect.dragPreview()
    };
  }
)(PlanListItem);
