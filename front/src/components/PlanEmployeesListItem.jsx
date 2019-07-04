import React, { Component } from "react";
import classNames from "classnames";
import Icon from "./Icon";
import { ICONS } from "../constants/icons";
import "./PlanEmployeesListItem.css";
import { DragSource } from "react-dnd";
import DragItemTypes from "../dragItemTypes";

class PlanEmployeesListItem extends Component {
  constructor(props) {
    super(props);

    this.state = { isEditing: false };

    this.renameClick = this.renameClick.bind(this);
    this.textInputOnBlur = this.textInputOnBlur.bind(this);
    this.textInputOnFocus = this.textInputOnFocus.bind(this);
    this.textInputOnKeyDown = this.textInputOnKeyDown.bind(this);
  }

  renameClick() {
    this.setState({ ...this.state, isEditing: true });
  }

  textInputOnBlur() {
    this.setState({ ...this.state, isEditing: false });
  }

  textInputOnFocus(e) {
    e.target.select();
  }

  textInputOnKeyDown(e) {
    if (e.key === "Enter") {
      this.props.patchEmployee({
        ...this.props.employee,
        firstName: e.target.value
      });
      e.target.blur();
    }
  }

  render() {
    const badgeStyle = {
      backgroundColor: this.props.employee.color
    };

    const liClasses = classNames("planEmployeesListItem", {
      planEmployeesListItemSelected: this.props.selected
    });

    const badgeClasses = classNames("planEmployeesListItemBadge", {
      badgeSelected: this.props.selected
    });

    var li = null;

    if (this.state.isEditing && this.props.selected) {
      li = (
        <li onClick={this.props.onClick} className={liClasses}>
          <span style={badgeStyle} className={badgeClasses} />
          <input
            type="text"
            autoFocus
            onKeyDown={this.textInputOnKeyDown}
            onFocus={this.textInputOnFocus}
            className="planEmployeesListItemTextInput"
            defaultValue={this.props.employee.firstName}
            onBlur={this.textInputOnBlur}
          />
        </li>
      );
    } else {
      li = (
        <li onClick={this.props.onClick} className={liClasses}>
          <span style={badgeStyle} className={badgeClasses} />
          <span className="planEmployeesListItemText">
            {this.props.employee.firstName}
          </span>
          <span
            className="planEmployeesListItemEditButton"
            onClick={this.renameClick}
          >
            <Icon icon={ICONS.RENAME} size={16} />
          </span>
        </li>
      );
    }
    return this.props.connectDragSource(li);
  }
}

export default DragSource(
  DragItemTypes.SIDEBAR_STAFF,
  // source:
  {
    beginDrag(props, monitor, component) {
      return {
        id: props.employee.id
      };
    }
  }, // collect:
  (connect, monitor) => {
    return {
      connectDragSource: connect.dragSource(),
      connectDragPreview: connect.dragPreview(),
      isDragging: monitor.isDragging()
    };
  }
)(PlanEmployeesListItem);
