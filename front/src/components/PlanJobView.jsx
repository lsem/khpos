import "./PlanJobView.css";
import React from "react";
import { DragSource } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import _ from "lodash";
import classNames from "classnames";
import DragItemTypes from "../dragItemTypes";
import TechMapStep from "./TechMapStep";

const techMapViewSource = {
  beginDrag(props, monitor, component) {
    return {
      techMapId: props.techMap.id,
      jobId: props.job.id,
      colIndex: props.colIndex, // index of source component
      rowIndex: props.rowIndex // index of source component
    };
  }
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
    connectDragPreview: connect.dragPreview(),
    itemType: monitor.getItemType()
  };
}

class PlanJobView extends React.Component {
  static calcHeight(minutes, minsToPixels) {
    return minsToPixels(minutes);
  }

  constructor(props) {
    super(props);
    this.ref = null;
    this.setRef = this.setRef.bind(this);
    this.handleTaskAssign = this.handleTaskAssign.bind(this);
  }

  calcStepDuration = step => {
    const job = this.props.job;
    return step.humanResources
      .find(hr => hr.peopleCount === job.employeesQuantity)
      .countByUnits.get(job.productionQuantity);
  };

  calcJobDuration = () => {
    return this.props.steps.reduce((acc, s) => {
      return (acc += this.calcStepDuration(s));
    });
  };

  setRef(ref) {
    this.ref = ref;
    // forward ref up
    this.props.innerRef(ref);
  }

  componentDidMount() {
    // Use empty image as a drag preview so browsers don't draw it
    // and we can draw whatever we want on the custom drag layer instead
    this.props.connectDragPreview(getEmptyImage());
  }

  handleTaskAssign(taskId, employeeId) {
    this.props.handleJobTaskAssign(this.props.job.id, taskId, employeeId);
  }

  render() {
    const { connectDragSource, isDragging } = this.props;
    const techMapStyle = {
      width: this.props.width,
      left: this.props.left,
      top: this.props.top,
      opacity: isDragging ? 0.2 : 1,
      display: this.props.hidden ? "none" : "block"
    };

    let className = classNames({
      PlanJobView: true,
      "TechMapView-isOver": this.props.isOver
    });

    let assignments = [];
    if (this.props.job && this.props.job.stepAssignments)
      assignments = this.props.job.stepAssignments;

    const steps = this.props.techMap
      ? _.map(this.props.techMap.steps, s => {
          return (
            <TechMapStep
              height={this.props.minsToPixels(this.calcStepDuration(s))}
              step={s}
              key={s.id}
              employees={this.props.employees}
              stepAssignments={assignments.filter(a => a.stepId === s.id)}
              assign={this.handleTaskAssign}
            />
          );
        })
      : null;

    return connectDragSource(
      <div className={className} style={techMapStyle} ref={this.setRef}>
        {steps}
      </div>
    );
  }
}

export default _.flow(
  DragSource(DragItemTypes.TIMELINE_TECHMAP, techMapViewSource, collect)
)(PlanJobView);
