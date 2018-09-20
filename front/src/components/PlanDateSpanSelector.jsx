import React, { PureComponent } from 'react';
import moment from 'moment';

import './PlanDateSpanSelector.css'

export default class PlanDateSpanSelector extends PureComponent {
  componentDidMount() {
    this.props.setPlanDateSpan(this.props.beginTime, this.props.endTime);
  }

  decreseDay = () => {
    this.props.setPlanDateSpan(
      moment(this.props.beginTime).subtract(1, "days"), 
      moment(this.props.endTime).subtract(1, "days")
    );
  }

  increseDay = () =>  {
    this.props.setPlanDateSpan(
      moment(this.props.beginTime).add(1, "days"), 
      moment(this.props.endTime).add(1, "days")
    );
  }

  render() {
    return (
      <div className="planDateSpanSelectorContainer">
        <div onClick={this.decreseDay}>&lt;</div>
        <div>{moment(this.props.beginTime).calendar().split(" о")[0]}</div>
        <div onClick={this.increseDay}>&gt;</div>
      </div>
    )
  }
}

