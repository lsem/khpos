import { DropTarget } from "react-dnd";
import PropTypes from "prop-types";
import TechMapView from "./TechMapView";
import React from "react";
import { autoLayout } from "./layout";
import classNames from "classnames";
import _ from "lodash";

function getSampleJobs() {
  return [
    {
      title: "1",
      tintColor: "rgb(216, 216, 216)",
      durationHours: 2.5,
      startTime: Date.parse("01 Jan 1970 00:30:00 GMT"),
      id: "1"
    },
    {
      title: "2",
      tintColor: "rgb(216, 216, 216)",
      durationHours: 1.5,
      startTime: Date.parse("01 Jan 1970 02:00:00 GMT"),
      id: "2"
    },
    {
      title: "3",
      tintColor: "rgb(216, 216, 216)",
      durationHours: 3.5,
      startTime: Date.parse("01 Jan 1970 01:00:00 GMT"),
      id: "3"
    },
    {
      title: "4",
      tintColor: "rgb(216, 216, 216)",
      durationHours: 0.7,
      startTime: Date.parse("01 Jan 1970 1:30:00 GMT"),
      id: "4"
    },
    {
      title: "5",
      tintColor: "rgb(216, 216, 216)",
      durationHours: 0.7,
      startTime: Date.parse("01 Jan 1970 6:30:00 GMT"),
      id: "5"
    },
    {
      title: "6",
      tintColor: "rgb(216, 216, 216)",
      durationHours: 0.4,
      startTime: Date.parse("01 Jan 1970 7:00:00 GMT"),
      id: "6"
    },
    {
      title: "7",
      tintColor: "rgb(216, 216, 216)",
      durationHours: 1.2,
      startTime: Date.parse("01 Jan 1970 7:35:00 GMT"),
      id: "7"
    },
    {
      title: "8",
      tintColor: "rgb(216, 216, 216)",
      durationHours: 1.2,
      startTime: Date.parse("01 Jan 1970 6:30:00 GMT"),
      id: "8"
    },
    {
      title: "9",
      tintColor: "rgb(216, 216, 216)",
      durationHours: 1.2,
      startTime: Date.parse("01 Jan 1970 7:00:00 GMT"),
      id: "9"
    },
    {
      title: "10",
      tintColor: "rgb(216, 216, 216)",
      durationHours: 1.2,
      startTime: Date.parse("01 Jan 1970 7:30:00 GMT"),
      id: "10"
    },
    {
      // On this example we can see the fact that views are not
      // clipped.
      title: "11",
      tintColor: "rgb(216, 216, 216)",
      durationHours: 4.0,
      startTime: Date.parse("01 Jan 1970 23:00:00 GMT"),
      id: "11"
    }
  ];
}

function collect(connect, monitor) {
  return {
    highlighted: monitor.canDrop(),
    isOver: monitor.isOver(),
    connectDropTarget: connect.dropTarget()
  };
}
const techMapViewColumnTarget = {
  drop(props, monitor) {
    // /moveKnight(props.x, props.y);
  }
};

class SchedulerTimeline extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      jobs: getSampleJobs()
    };
  }

  render() {
    const msToHours = ms => ms / (1000 * 60 * 60);
    const hoursToMs = h => h * 1000 * 60 * 60;
    const msToPixels = ms => msToHours(ms) * this.props.durationScalingFator;
    const jobHeight = j => msToPixels(hoursToMs(j.durationHours));
    const jobTop = j => msToPixels(j.startTime - this.props.beginTime);

    const jobLayoutMapper = {
      vbegin: x => x.startTime,
      vend: x => x.startTime + hoursToMs(x.durationHours),
      identity: x => x.title
    };
    const layout = autoLayout(this.state.jobs, jobLayoutMapper);
    //const layout = autoLayout_dumb(this.state.jobs, jobLayoutMapper);

    const groupedByCols = _.groupBy(layout, x => x.col);
    const columnViews = _.keys(groupedByCols).map((x, x_idx) => {
      const columnJobIds = _.map(groupedByCols[x], x => x.item.id);
      console.log("columnJobIds: ", columnJobIds);
      const columnJobs = _.filter(this.state.jobs, x =>
        _.includes(columnJobIds, x.id)
      );
      const columnTechMaps = columnJobs.map((job, idx) => (
        <TechMapView
          title={job.title}
          tintColor={job.tintColor}
          height={jobHeight(job)}
          left={0}
          width={this.props.jobWidth}
          top={jobTop(job)}
          key={job.id}
        />
      ));
      const style = {
        left: x_idx * (this.props.jobWidth + 10),
        width: this.props.jobWidth,
        height: msToPixels(this.props.endTime)
      };
      return (
        <div className="SchedulerTimelineColumn" style={style}>
          <div className={className}>{columnTechMaps}</div>
        </div>
      );
    });
    // Style ovverides
    const style = {
      left: this.props.left,
      height: this.props.height
    };

    console.log(columnViews);

    const { highlighted, isOver, connectDropTarget } = this.props;

    let className = classNames({
      SchedulerTimeline: true,
      // "SchedulerTimeline--highlighted": highlighted,
      "SchedulerTimeline--hovered": isOver
    });
    return connectDropTarget(
      <div className={className} style={style}>
        {columnViews}
      </div>
    );
  }
}
SchedulerTimeline.propTypes = {
  connectDropTarget: PropTypes.func.isRequired,
  isOver: PropTypes.bool.isRequired
};

export default DropTarget("techmap", techMapViewColumnTarget, collect)(
  SchedulerTimeline
);
//export default  SchedulerTimeline;
