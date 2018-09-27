import React from "react";
import moment from "moment";
import "./AssignmentsTimeline.css";
import _ from "lodash";

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

  const renderOverlaps = overlap => {
    const style = {
      backgroundColor: "rgb(255,77,77)",
      top: msToPixels(overlap.top - beginTime),
      height: msToPixels(overlap.bottom - overlap.top),
      width: columnWidth + 10,
      left: -5,
      borderRadius: 3
    };
    return <div style={style} className="assignmentsTimeSpan-overlap" />;
  };

  const findOverlaps = abw => {
    const sorted = _.sortBy(_.values(abw), r1 => r1.startTime);
    const overlaps = [];
    if (sorted.length > 1) {
      for (let i = 0; i < sorted.length - 1; ++i) {
        if (sorted[i + 1].startTime < sorted[i].endTime) {
          const overlapTop = sorted[i + 1].startTime;
          const overlapBottom = Math.min(
            sorted[i + 1].endTime,
            sorted[i].endTime
          );
          overlaps.push({ top: overlapTop, bottom: overlapBottom });
        }
      }
    }
    return overlaps;
  };

  const renderColumns = assignmentsByWorkers => {
    let left = 0;

    return _.map(assignmentsByWorkers, (abw, key) => {
      const columnStyle = {
        width: columnWidth,
        height: msToPixels(endTime - beginTime)
        //left: left += columnWidth
      };

      const overlaps = findOverlaps(abw);

      return (
        <div
          className="assignmentsTimelineColumn"
          style={columnStyle}
          key={key}
        >
          {_.map(overlaps, o => renderOverlaps(o))}
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
