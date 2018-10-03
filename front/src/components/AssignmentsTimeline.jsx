import React from "react";
import "./AssignmentsTimeline.css";
import _ from "lodash";
import classNames from "classnames";

function AssignmentsTimeline(props) {
  const { jobs, columnWidth, msToPixels, beginTime, endTime } = props;

  const minsToMills = mins => mins * 60 * 1000;

  const tasksByWorkers = _(jobs)
    .map(j => {
      let startTime = j.startTime;
      return _.map(j.techMap.tasks, t => {
        const st = startTime;
        startTime += minsToMills(t.durationMins);
        return {
          ...t,
          startTime: st,
          endTime: st + minsToMills(t.durationMins)
        };
      });
    })
    .flatMap()
    .filter(t => t.assigned)
    .flatMap(t => {
      return _.map(t.assigned, a => {
        return {
          ...a,
          startTime: t.startTime,
          endTime: t.endTime
        };
      });
    })
    .sortBy(a => a.startTime)
    .groupBy(a => a.firstName)
    .value();

  const tasksByColumns = [];

  _.forEach(tasksByWorkers, tbw => {
    tasksByColumns.push([]);
    _.forEach(tbw, (t, i) => {
      if (tbw[i - 1] && t.startTime < tbw[i - 1].endTime) {
        t.overlaps = tbw[i - 1].overlaps = true;
        tasksByColumns.push([]);
      }
      tasksByColumns[tasksByColumns.length - 1].push(t);
    });
  });

  const renderAssignmentTimeSpan = assignment => {
    const assignmentTimeSpanStyle = {
      backgroundColor: assignment.color,
      top: msToPixels(assignment.startTime - beginTime),
      height: msToPixels(assignment.endTime - assignment.startTime),
      width: columnWidth + 1,
      borderRadius: columnWidth
    };

    const classes = classNames("assignmentsTimeSpan", {
      assignmentsTimeSpanOverlaps: assignment.overlaps
    });

    return (
      <div
        style={assignmentTimeSpanStyle}
        className={classes}
        key={assignment.key}
      />
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
          {_.map(tbc, a => renderAssignmentTimeSpan(a))}
        </div>
      );
    });
  };

  return (
    <div className="assignmentsTimeline">{renderColumns(tasksByColumns)}</div>
  );
}

export default AssignmentsTimeline;
