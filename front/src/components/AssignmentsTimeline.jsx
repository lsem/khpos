import React from "react";
import "./AssignmentsTimeline.css";
import _ from "lodash";
import classNames from "classnames";
import moment from "moment";
import PlanJobView from "./PlanJobView";

function AssignmentsTimeline(props) {
  const { jobs, columnWidth, msToPixels, beginTime, endTime } = props;

  const minsToMills = mins => mins * 60 * 1000;

  const stepsByEmployees = _(jobs)
    .filter(j => j.stepAssignments && j.stepAssignments.length)
    .flatMap(j =>
      _.map(j.stepAssignments, a => {
        const prevSteps = _.takeWhile(j.techMap.steps, s => s.id !== a.stepId);
        const startTime =
          moment(j.startTime).valueOf() +
          minsToMills(
            prevSteps.reduce(
              (acc, s) => (acc += PlanJobView.calcStepDuration(j, s.id)),
              0
            )
          );
        const endTime =
          startTime +
          minsToMills(
            PlanJobView.calcStepDuration(
              j,
              a.stepId
            )
          );
        return {
          firstName: a.employee.firstName,
          color: a.employee.color,
          startTime,
          endTime
        };
      })
    )
    .sortBy(a => a.startTime)
    .groupBy(a => a.firstName)
    .value();

  var stepsByEmployeesOrderedByFirstName = {};
  _(stepsByEmployees)
    .keys()
    .sort()
    .each(function(key) {
      stepsByEmployeesOrderedByFirstName[key] = stepsByEmployees[key];
    });

  const tasksByColumns = [];

  _.forEach(stepsByEmployeesOrderedByFirstName, tbw => {
    tasksByColumns.push([]);
    _.forEach(tbw, (t, i) => {
      for (let j = 0; j < i; j++) {
        if (t.startTime < tbw[j].endTime) {
          t.overlaps = tbw[j].overlaps = true;
          break;
        }
      }
      if (tbw[i - 1] && t.startTime < tbw[i - 1].endTime) {
        tasksByColumns.push([]);
      }
      tasksByColumns[tasksByColumns.length - 1].push(t);
    });
  });

  const renderAssignmentTimeSpan = (assignment, key) => {
    const assignmentTimeSpanStyle = {
      backgroundColor: assignment.color,
      top: msToPixels(assignment.startTime - beginTime),
      height: msToPixels(assignment.endTime - assignment.startTime),
      borderRadius: columnWidth / 2
    };

    const classes = classNames("assignmentsTimeSpan", {
      assignmentsTimeSpanOverlaps: assignment.overlaps
    });

    return (
      <div style={assignmentTimeSpanStyle} className={classes} key={key} />
    );
  };

  const renderColumns = tasksByColumns => {
    return _.map(tasksByColumns, (tbc, key) => {
      const columnStyle = {
        width: columnWidth,
        height: msToPixels(endTime - beginTime)
      };

      return (
        <div
          className="assignmentsTimelineColumn"
          style={columnStyle}
          key={key}
        >
          {_.map(tbc, (a, key) => renderAssignmentTimeSpan(a, key))}
        </div>
      );
    });
  };

  return (
    <div className="assignmentsTimeline">{renderColumns(tasksByColumns)}</div>
  );
}

export default AssignmentsTimeline;
