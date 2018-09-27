import React from "react";
import _ from "lodash";
import moment from "moment";
import "./AssignmentsTimeline.css";

function AssignmentsTimeline(props) {
  const { jobs, columnWidth, msToPixels, beginTime, endTime } = props;

  const groupByWorkers = jobs => {
    let assignmentsByWorkers = {};

    _.forEach(jobs, j => {
      let startTime = j.startTime;

      _.forEach(j.techMap.tasks, t => {
        let end = moment(startTime)
          .add(t.durationMins, "minutes")
          .valueOf();

        if (t.assigned) {
          _.forEach(t.assigned, a => {
            if (!assignmentsByWorkers[a.id]) assignmentsByWorkers[a.id] = [];
            assignmentsByWorkers[a.id].push({
              ...a,
              startTime,
              endTime: end,
              key: j.id + t.id + a.id
            });
          });
        }
        startTime += end - startTime;
      });
    });
    return assignmentsByWorkers;
  };

  const renderAssignmentTimeSpan = assignment => {
    const assignmentTimeSpanStyle = {
      backgroundColor: assignment.color,
      top: msToPixels(assignment.startTime - beginTime),
      height: msToPixels(assignment.endTime - assignment.startTime),
      width: columnWidth,
      borderRadius: columnWidth
    };

    return (
      <div
        style={assignmentTimeSpanStyle}
        className="assignmentsTimeSpan"
        key={assignment.key}
      />
    );
  };

  const renderColumns = assignmentsByWorkers => {
    let left = 0;
    return _.map(assignmentsByWorkers, (abw, key) => {
      const columnStyle = {
        width: columnWidth,
        height: msToPixels(endTime - beginTime)
        //left: left += columnWidth
      };
      return (
        <div
          className="assignmentsTimelineColumn"
          style={columnStyle}
          key={key}
        >
          {_.map(abw, a => renderAssignmentTimeSpan(a))}
        </div>
      );
    });
  };

  return (
    <div className="assignmentsTimeline">
      {renderColumns(groupByWorkers(jobs))}
    </div>
  );
}

export default AssignmentsTimeline;
