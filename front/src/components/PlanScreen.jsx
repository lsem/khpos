import "./PlanScreen.css";
import React from "react";
import { connect } from "react-redux";
import PlanTimeline from "./PlanTimeline";
import AssignmentsTimeline from "./AssignmentsTimeline";
import PlanDateSpanSelector from "./PlanDateSpanSelector";
import PlanTechMapsMenu from "./PlanTechMapsMenu";
import PlanEmployeesMenu from "./PlanEmployeesMenu";
import CustomDragLayer from "./CustomDragLayer";
import DragAndDropManager from "../DndManager/DragAndDropManager";
import DetectDragModifierKeysHelper from "../detectDragModifierKeysHelper";
import _ from "lodash";
import uuid from "uuid";

import { thunkRequestTechMaps } from "../store/techMaps/thunks";
import {
  thunkRequestEmployees,
  thunkPatchEmployee
} from "../store/employees/thunks";
import {
  thunkSetTimeSpan,
  thunkInsertJob,
  thunkPatchJob,
  thunkAssignJob
} from "../store/plan/thunks";
import moment from "moment";

class PlanScreen extends React.Component {
  constructor(props) {
    super(props);
    this.minsToPixels = this.minsToPixels.bind(this);
    this.pixelsToMins = this.pixelsToMins.bind(this);
    this.setUpDnd();
    this.setUpUI();
    this.state = {
      isTechMapOverTimeline: false,
      isTechMapHoveringTimeline: false,
      techMapPreviewHoverRect: null,
      techMapPreviewHoverTranslatedRect: null,
      PlanTimelineRect: null,
      initialOffset: null,
      scrollTop: 0,
      scollLeft: 0
    };
    this.onModifierKeyChanged = this.onModifierKeyChanged.bind(this);
    this.detectDragModifierKeysHelper = new DetectDragModifierKeysHelper(
      this.onModifierKeyChanged
    );
    this.handleJobTaskAssign = this.handleJobTaskAssign.bind(this);
  }

  handleJobTaskAssign(jobId, taskId, employeeId) {
    const employee = this.props.employees.find(e => e.id === employeeId);
    this.props.assignJobTask(jobId, taskId, employee);
  }

  componentDidMount() {
    this.detectDragModifierKeysHelper.componentDidMount();
  }

  componentWillUnmount() {
    this.detectDragModifierKeysHelper.componentWillUnmount();
  }

  onModifierKeyChanged(state) {
    this.dndManager.onShiftPressed(state["shiftKey"]);
  }

  setUpDnd() {
    this.dropTechMapAction = this.dropTechMapAction.bind(this);
    this.draggedRectChangedAction = this.draggedRectChangedAction.bind(this);
    this.draggingStartedAction = this.draggingStartedAction.bind(this);
    this.draggingFinishedAction = this.draggingFinishedAction.bind(this);
    this.lockDragHorizontalMove = this.lockDragHorizontalMove.bind(this);
    this.swapTechMaps = this.swapTechMaps.bind(this);
    this.moveJob = this.moveJob.bind(this);
    this.columnHovered = this.columnHovered.bind(this);
    this.dndManager = new DragAndDropManager({
      dropTechMapAction: this.dropTechMapAction,
      draggedRectChangedAction: this.draggedRectChangedAction,
      draggingStartedAction: this.draggingStartedAction,
      draggingFinishedAction: this.draggingFinishedAction,
      lockDragHorizontalMove: this.lockDragHorizontalMove,
      swapTechMaps: this.swapTechMaps,
      moveJob: this.moveJob,
      columnHovered: this.columnHovered
    });
  }

  setUpUI() {
    this.onTechMapPreviewEnteredTimeline = this.onTechMapPreviewEnteredTimeline.bind(
      this
    );
    this.onTechMapPreviewLeftTimeline = this.onTechMapPreviewLeftTimeline.bind(
      this
    );
    this.onTechMapPreviewStartedDragging = this.onTechMapPreviewStartedDragging.bind(
      this
    );
    this.onTechMapPreviewFinishedDragging = this.onTechMapPreviewFinishedDragging.bind(
      this
    );
    this.onTechMapPreviewDomNodeRefUpdate = this.onTechMapPreviewDomNodeRefUpdate.bind(
      this
    );
    this.onTechMapPreviewOffsetChanged = this.onTechMapPreviewOffsetChanged.bind(
      this
    );
    this.onSchedulerTimelineDomNodeRefUpdate = this.onSchedulerTimelineDomNodeRefUpdate.bind(
      this
    );
    this.columnAttached = this.columnAttached.bind(this);
    this.columnDetached = this.columnDetached.bind(this);
    this.techMapAttached = this.techMapAttached.bind(this);
    this.techMapDetached = this.techMapDetached.bind(this);
    this.onDrop = this.onDrop.bind(this);
  }

  //////////////////////////////////////////////////////////////

  dropTechMapAction(techMapId, column, row, offsetInPixels) {
    // todo: handle minus offset
    if (offsetInPixels < 0) {
      console.error("offsetInPixels < 0");
      return;
    }
    this.props.insertJob({
      id: "JOB-" + uuid.v4(),
      column,
      startTime: moment(this.props.timelineBeginTime)
        .add(this.pixelsToMins(offsetInPixels), "minutes")
        .valueOf(),
      techMap: this.props.techMaps.find(t => t.id === techMapId),
      quantity: 1
    });
  }
  draggedRectChangedAction(rect) {
    this.setState({
      techMapPreviewHoverTranslatedRect: rect,
      isTechMapHoveringTimeline: true
    });
  }
  draggingStartedAction() {
    this.setState({
      isTechMapHoveringTimeline: true
    });
  }
  draggingFinishedAction() {
    this.setState({
      isTechMapHoveringTimeline: false
    });
  }
  lockDragHorizontalMove(offsetX) {
    this.setState({
      draggedTechMapHorizontalLock: offsetX
    });
  }
  swapTechMaps(column, draggedJobId, existingJobId) {
    const draggedJob = { ...this.props.jobs.find(j => j.id === draggedJobId) };
    const targetJob = { ...this.props.jobs.find(j => j.id === existingJobId) };

    this.props.patchJob(draggedJob);
    this.props.patchJob(targetJob);
  }
  moveJob(id, column, offsetInPixels) {
    const affectedJob = {
      ...this.jobs.find(j => j.id === id),
      column,
      startTime: moment(this.props.timelineBeginTime)
        .add(this.pixelsToMins(offsetInPixels), "minutes")
        .valueOf()
    };

    this.props.patchJob(affectedJob);
  }
  columnHovered(column) {
    this.setState({
      hoverColumn: column
    });
  }

  //////////////////////////////////////////////////////////////

  columnAttached(column, domRect) {
    this.dndManager.onTimelineColumnAttached(
      column,
      this.domRectToInternalRect(domRect)
    );
  }

  columnDetached(column) {
    this.dndManager.onTimelineColumnDetached(column);
  }

  techMapAttached(techMapId, jobId, domRect, column, rect) {
    this.dndManager.onTechMapAttached(
      techMapId,
      jobId,
      this.domRectToInternalRect(domRect),
      column,
      rect
    );
  }

  techMapDetached(techMapId) {
    this.dndManager.onTechMapDetached(techMapId);
  }

  setScrollLeftTopPositionDebounced = _.debounce((left, top) => {
    // Todo: got rid of this.
    this.setState({
      scrollTop: top,
      scrollLeft: left
    });
    this.dndManager.onTimelineScroll(left, top);
  }, 30);

  onSchedulerTimelineDomNodeRefUpdate(ref) {
    if (ref) {
      this.dndManager.onTimelineAttached(
        this.domRectToInternalRect(ref.getBoundingClientRect())
      );
      ref.addEventListener("scroll", e => {
        this.setScrollLeftTopPositionDebounced(ref.scrollLeft, ref.scrollTop);
      });
    } else {
      this.dndManager.onTimelineDetached();
      // console.warn('onSchedulerTimelineDomNodeRefUpdate: dom detached');
    }
  }

  minsToPixels(mins) {
    return this.props.pixelsPerMinute * mins;
  }

  pixelsToMins(pixels) {
    return pixels / this.props.pixelsPerMinute;
  }

  msToPixels = miliseconds => {
    return this.minsToPixels(miliseconds / 1000 / 60);
  };

  onTechMapPreviewStartedDragging(item, itemType) {
    this.dndManager.onDraggedTechMapStartedDragging(item, itemType);
  }

  onTechMapPreviewFinishedDragging() {
    this.dndManager.onDraggedTechMapFinishedDragging();
  }

  onTechMapPreviewEnteredTimeline(item, initialOffset) {
    this.dndManager.onDraggedTechMapEntered(item.techMapId, initialOffset);
  }

  onTechMapPreviewLeftTimeline() {
    this.dndManager.onDraggedTechMapLeft();
  }

  domRectToInternalRect(domRect) {
    return {
      top: domRect.top,
      left: domRect.left,
      width: domRect.width,
      height: domRect.height,
      bottom: domRect.top + domRect.height,
      right: domRect.left + domRect.width
    };
  }

  onTechMapPreviewDomNodeRefUpdate(ref) {
    if (ref) {
      this.dndManager.onDraggedTechMapGotRect(
        this.domRectToInternalRect(ref.getBoundingClientRect())
      );
    } else {
      this.dndManager.onDraggedTechMapLostRect();
    }
  }

  // Returns rect in respect to otherRect. Both expected to be in world coordinates.
  translateRectToOtherRect(rect, otherRect) {
    return {
      top: rect.top - otherRect.top,
      left: rect.left - otherRect.left,
      width: rect.width,
      height: rect.height
    };
  }

  onTechMapPreviewOffsetChanged(offset, diffOffset, initialOffset) {
    // To handle drop we should know geometry of columns.
    // Or alternatively, we can get timeline decide and once drop position
    // is detected to either make action or ask PlanScreen via callback.
    this.dndManager.onDraggedTechMapPositionChanged(
      offset,
      diffOffset,
      initialOffset
    );
  }

  onDrop(item) {
    this.dndManager.onDrop(item);
  }

  setPlanDateSpan = (fromDate, toDate) => {
    this.props.setTimeSpan(fromDate, toDate);
  };

  render() {
    return (
      <div className="PlanScreen">
        <div className="leftContainer">
          <PlanDateSpanSelector
            setPlanDateSpan={this.setPlanDateSpan}
            beginTime={this.props.timelineBeginTime}
            endTime={this.props.timelineEndTime}
          />
          <div className="timelineScroll">
            <AssignmentsTimeline
              jobs={this.props.jobs}
              columnWidth={12}
              msToPixels={this.msToPixels}
              beginTime={this.props.timelineBeginTime}
              endTime={this.props.timelineEndTime}
            />
            <PlanTimeline
              onSchedulerTimelineDomNodeRefUpdate={
                this.onSchedulerTimelineDomNodeRefUpdate
              }
              presentTechMapHover={this.state.isTechMapHoveringTimeline}
              techMapPreviewHoverRect={
                this.state.techMapPreviewHoverTranslatedRect
              }
              onTechMapPreviewEnteredTimeline={
                this.onTechMapPreviewEnteredTimeline
              }
              onTechMapPreviewLeftTimeline={this.onTechMapPreviewLeftTimeline}
              onTechMapPreviewOffsetChanged={this.onTechMapPreviewOffsetChanged}
              scrollTop={this.state.scrollTop}
              scrollLeft={this.state.scrollLeft}
              techMapAttached={this.techMapAttached}
              techMapDetached={this.techMapDetached}
              minsToPixels={this.minsToPixels}
              columnAttached={this.columnAttached}
              columnDetached={this.columnDetached}
              durationScalingFator={100}
              jobWidth={100}
              horizontalPadding={15}
              beginTime={this.props.timelineBeginTime}
              endTime={this.props.timelineEndTime}
              jobs={this.props.jobs}
              left={0}
              hoverColumn={this.state.hoverColumn}
              onDrop={this.onDrop}
              handleJobTaskAssign={this.handleJobTaskAssign}
            />
          </div>
        </div>
        <div className="PlanScreenSideContainer">
          <PlanEmployeesMenu
            employees={this.props.employees}
            requestEmployees={this.props.requestEmployees}
            patchEmployee={this.props.patchEmployee}
          />
          <PlanTechMapsMenu
            techMaps={this.props.techMaps}
            requestTechMaps={this.props.requestTechMaps}
          />
        </div>
        {/* Instantiate CustomDragLayer to get react-dnd aware about custom drag layey.
          Our of drag and drop context it must not affect rendering. */}
        <CustomDragLayer
          techMaps={this.props.techMaps}
          jobs={this.props.jobs}
          minsToPixels={this.minsToPixels}
          onTechMapPreviewStartedDragging={this.onTechMapPreviewStartedDragging}
          onTechMapPreviewFinishedDragging={
            this.onTechMapPreviewFinishedDragging
          }
          onTechMapPreviewDomNodeRefUpdate={
            this.onTechMapPreviewDomNodeRefUpdate
          }
          draggedTechMapHorizontalLock={this.state.draggedTechMapHorizontalLock}
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    timelineBeginTime: state.plan.timeSpan.fromDate,
    timelineEndTime: state.plan.timeSpan.toDate,
    jobs: state.jobs,
    techMaps: state.techMaps,
    employees: state.employees
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setTimeSpan: (fromDate, toDate) =>
      dispatch(thunkSetTimeSpan({ fromDate, toDate })),
    requestTechMaps: () => dispatch(thunkRequestTechMaps()),
    requestEmployees: () => dispatch(thunkRequestEmployees()),
    patchEmployee: employee => dispatch(thunkPatchEmployee(employee)),
    patchJob: job => dispatch(thunkPatchJob(job)),
    insertJob: job => dispatch(thunkInsertJob(job)),
    assignJobTask: (jobId, taskId, employee) =>
      dispatch(thunkAssignJob(jobId, taskId, employee))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlanScreen);
