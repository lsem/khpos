import React from "react";
import "./AssignmentsTimeline.css";
import _ from "lodash";
import classNames from "classnames";
import moment from "moment";

function AssignmentsTimeline(props) {
  const { jobs, columnWidth, msToPixels, beginTime, endTime } = props;

  const minsToMills = mins => mins * 60 * 1000;

  const tasksByWorkers = _(jobs)
    .map(j => {
      let startTime = moment(j.startTime).valueOf();
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

  var tasksByWorkersOrderedByFirstName = {};
  _(tasksByWorkers)
    .keys()
    .sort()
    .each(function(key) {
      tasksByWorkersOrderedByFirstName[key] = tasksByWorkers[key];
    });

  const tasksByColumns = [];

  _.forEach(tasksByWorkersOrderedByFirstName, tbw => {
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
      <div
        style={assignmentTimeSpanStyle}
        className={classes}
        key={key}
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
