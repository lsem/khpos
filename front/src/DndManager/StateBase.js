export default class {
  constructor(factory, nextState, commonState, stateActions) {
    this.stateActions = stateActions;
    this.factory = factory;
    this.nextState = nextState;
    this.commonState = commonState;
    this.columnRects = {};
    this.columnTechMaps = {};
    this.draggTechMapRect = null;
  }

  toIdleState() {
    this.nextState(this.factory.makeIdleState(this.factory, this.nextState, this.commonState));
  }

  onTimelineScroll(left, top) {
    this.commonState.scrollLeft = left;
    this.commonState.scrollTop = top;
  }

  onTimelineAttached(rect) {}
  onTimelineDetached() {}

  onDraggedTechMapFinishedDragging() {
    console.log('stateBase: onDraggedTechMapFinishedDragging')
    this.toIdleState();
    this.stateActions.lockDraggedTechMapHorizontalMove(null);
  }
  onTimelineColumnAttached(column, rect) {
    this.columnRects[column] = rect;
  }
  onTimelineColumnDetached(column) {
    // todo: this must be handled in case of changing columns configuration.
    // alternatively we can clear all rects on update.
    // this might also appear as bug in case of size changes which
    // are expected in case of resizing.
  }

  onTechMapAttached(techMapId, jobId, rect, column, row) {
    // techMapId is not used.
    this.columnTechMaps[column] = this.columnTechMaps[column] || {};
    this.columnTechMaps[column][jobId] = { jobId: jobId, row: row, rect: rect};
    //console.log('this.columnTechMaps[column]: ', this.columnTechMaps[column])
  }

  onTechMapDetached(techMapId) {
    //delete this.techMapRects[techMapId];
  }

  onDraggedTechMapGotRect(rect) {
    this.draggTechMapRect = rect;
  }
  onDraggedTechMapLostRect() {}
  onDraggedTechMapEntered(id) {
    //this.onDraggingStarted();
  }
  onDraggedTechMapLeft() {
    this.stateActions.draggingFinishedAction();
    this.toIdleState();
  }
  onDraggedTechMapPositionChanged(offset, diffOffset, initialOffset) {}
}
