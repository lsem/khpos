// All rects are passed in page coordinates
import IdleState from "./IdleState";
import DraggingState from "./DraggingState";

export default class DragAndDropManager {
  constructor(stateActions) {
    this.stateActions = stateActions;
    this.hoveringTechMapId = null;
    this.eventLog = [];
    this.factory = this.createFactory();
    this.nextState = this.nextState.bind(this);
    this.currentState = this.factory.makeIdleState(
      this.factory,
      this.nextState,
      this.commonState()
    );
    this.scrollLeft = 0; // todo: take it from initial configuration
    this.scrollTop = 0; // todo: take it from initial configuration
  }

  commonState() {
    return {
      scrollLeft: this.scrollLeft,
      scrollTop: this.scrollTop
    };
  }

  createFactory() {
    // todo: inject base state.
    return {
      makeIdleState: (factory, nextState) =>
        new IdleState(
          factory,
          nextState,
          this.commonState(),
          this.stateActions
        ),
      makeDraggingState: (
        factory,
        nextState,
        techMapId,
        item,
        itemType,
        rect,
        initialOffset
      ) => {
        return new DraggingState(
          factory,
          nextState,
          techMapId,
          item,
          itemType,
          rect,
          initialOffset,
          this.commonState(),
          this.stateActions
        );
      }
    };
  }

  nextState(newState) {
    // if (this.currentState.getName() === newState.getName()) {
    //   return;
    // }
    console.log(
      `DndManager: ${this.currentState.getName()} -> ${newState.getName()} `
    );
    this.currentState = newState;
  }

  raiseEvent(event) {
    this.eventLog.push(event);
    this.currentState.processEvent(event);
  }

  ////////////////////////////////////////////////////////////////////

  // Scoll event handler
  onTimelineScroll(left, top) {
    this.scrollLeft = left;
    this.scrollTop = top;
    // Do not propagate this event.
    this.currentState.onTimelineScroll(left, top);
  }

  onTimelineAttached(rect) {
    this.currentState.onTimelineAttached(rect);
  }

  onTimelineDetached() {
    this.currentState.onTimelineDetached();
  }

  onDraggedTechMapStartedDragging(item, itemType) {
    this.currentState.onDraggedTechMapStartedDragging(item, itemType);
  }

  onDraggedTechMapFinishedDragging() {
    this.currentState.onDraggedTechMapFinishedDragging();
  }

  onTimelineColumnAttached(column, rect) {
    this.currentState.onTimelineColumnAttached(column, rect);
  }

  onTimelineColumnDetached(column) {
    this.currentState.onTimelineColumnDetached(column);
  }

  onTechMapAttached(techMapId, jobId, rect, column, row) {
    this.currentState.onTechMapAttached(techMapId, jobId, rect, column, row);
  }

  onTechMapDetached(techMapId) {
    this.currentState.onTechMapDetached();
  }

  onDraggedTechMapEntered(id, initialOffset) {
    this.currentState.onDraggedTechMapEntered(id, initialOffset);
  }

  onDraggedTechMapGotRect(rect) {
    this.currentState.onDraggedTechMapGotRect(rect);
  }

  onDraggedTechMapLostRect() {
    this.currentState.onDraggedTechMapLostRect();
  }

  onDraggedTechMapLeft() {
    this.currentState.onDraggedTechMapLeft();
  }

  onDraggedTechMapPositionChanged(offset, diffOffset, initialOffset) {
    this.currentState.onDraggedTechMapPositionChanged(
      offset,
      diffOffset,
      initialOffset
    );
    // todo: check if really need all these input or something is static here.
  }
}
