import React, { Component } from 'react'
import './PlanStaffListItem.css'

export default class PlanStaffListItem extends Component {
  render() {
    const badgeStyle = {
      backgroundColor: this.props.worker.color
    }

    return (
      <li className="planStaffListItem">
        <div style={badgeStyle}></div>
        {this.props.worker.firstName}
      </li>
    )
  }
}
