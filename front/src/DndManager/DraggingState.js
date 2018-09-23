import StateBase from "./StateBase";
import _ from "lodash";
import DragItemTypes from "../dragItemTypes";

function translateRectToOtherRect(rect, otherRect) {
  return {
    top: rect.top - otherRect.top,
    left: rect.left - otherRect.left,
    width: rect.width,
    height: rect.height
  };
}

function posInRect(pos, rect) {
  return (
    pos.x > rect.left &&
    pos.x < rect.left + rect.width &&
    pos.y > rect.top &&
    pos.y < rect.top + rect.height
  );
}

function overlap(a1, b1, a2, b2) {
  return !(b1 < a2) && !(a1 > b2);
}

export default class extends StateBase {
  constructor(
    factory,
    nextState,
    techMapId,
    item,
    itemType,
    rect,
    initialOffset,
    commonState,
    stateActions
  ) {
    super(factory, nextState, commonState, stateActions);
    this.stateActions = stateActions;
    this.timelineRect = null;
    this.techMapId = techMapId;
    this.itemType = itemType;
    this.item = item;
    this.draggTechMapRect = rect;
    this.draggedTechMapRectInTimeline = null;
    this.initialOffset = initialOffset;
    this.planWindowRect = null;
    this.canDrop = false;
    this.dropColumn = null;
    this.prevColumnRects = null;
  }

  onTechMapAttached(techMapId, jobId, rect, column, row) {
    super.onTechMapAttached(techMapId, jobId, rect, column, row);
    if (this.itemType !== DragItemTypes.TIMELINE_TECHMAP) {
      // no lock required
      return;
    }
    if (!_.isEqual(this.prevColumnRects, this.columnRects)) {
      this.lockDraggedTechMapHorizontalMove();
    }
    this.prevColumnRects = _.cloneDeep(this.columnRects);
  }

  getName() {
    return "Dragging";
  }

  toIdleState() {
    this.nextState(this.factory.makeIdleState(this.factory, this.nextState));
  }

  onTimelineAttached(rect) {
    this.planWindowRect = rect;
  }

  updateDraggedRect(offset, initialOffset) {
    // TODO: consider moving this ugly calculations around (offset, diffofset)
    // somewhere else or got rid of it whatsoever.
    this.draggTechMapRect.left = offset.x - this.initialOffset.x;
    this.draggTechMapRect.top = offset.y - this.initialOffset.y;
    this.draggTechMapRect.bottom =
      this.draggTechMapRect.top + this.draggTechMapRect.height;
    this.draggTechMapRect.right =
      this.draggTechMapRect.left + this.draggTechMapRect.width;
  }

  translateRectToPlanWindowRect(rect) {
    const translatedRect = translateRectToOtherRect(rect, this.planWindowRect);
    translatedRect.left += this.commonState.scrollLeft;
    translatedRect.top += this.commonState.scrollTop;
    return translatedRect;
  }

  getCurrentElementInitialRect() {
    const thisTechMap = _.find(this.columnTechMaps, x => this.item.jobId in x);
    return thisTechMap ? thisTechMap[this.item.jobId].rect : null;
  }

  lockDraggedTechMapHorizontalMove() {
    const draggedViewInitialRect = this.getCurrentElementInitialRect();
    if (!draggedViewInitialRect) {
      console.error(
        "lockDraggedTechMapToVerticalMove: No draggedViewInitialRect"
      );
      return;
    }
    this.stateActions.lockDraggedTechMapHorizontalMove(
      draggedViewInitialRect.left
    );
  }

  unlockDraggedTechMapHorizontalMove() {
    this.stateActions.lockDraggedTechMapHorizontalMove(null);
  }

  handleDraggedTechMapMove(cursorPos, draggedTechMapRect) {
    // Calcualte actual dragged rect cooridnates, it will be used on drop.
    this.draggedTechMapRectInTimeline = this.translateRectToPlanWindowRect(
      draggedTechMapRect
    );
    // Yield an action about actulal dragged rect in timeline window coordinates
    this.stateActions.draggedRectChangedAction(
      this.draggedTechMapRectInTimeline
    );
    // Teset what kind of dragging event we have
    // it might be either dragging new item to timline
    // or dragging existing one.
    if (this.itemType === DragItemTypes.TIMELINE_TECHMAP) {
      // ..
    } else if (this.itemType === DragItemTypes.SIDEBAR_TECHMAP) {
      // ..
    }

    // test for column hit (can be done in window coordinates)
    const columnHit = _.find(
      _.map(this.columnRects, (rect, index) => [index, rect]),
      x => posInRect(cursorPos, x[1])
    );
    if (!columnHit) {
      return;
    }
    const column = columnHit[0];

    if (!this.columnTechMaps[column]) {
      // special case when column has no techmaps inside
      console.log(`Column ${column} has no techmaps`);
      this.canDrop = true;
      this.dropColumn = column;
      return;
    }

    const columnTechMaps = Object.values(this.columnTechMaps[column]);
    const foundOverlap = _.find(columnTechMaps, x => {
      return overlap(
        x.rect.top,
        x.rect.bottom,
        draggedTechMapRect.top,
        draggedTechMapRect.bottom
      );
    });
    if (foundOverlap) {
      console.log("overlap");
      this.canDrop = false;
    } else {
      console.log("do not overalap!");
      this.canDrop = true;
      this.dropColumn = column;
    }
  }

  onDraggedTechMapPositionChanged(offset, diffOffset, initialOffset) {
    this.updateDraggedRect(offset, initialOffset);
    this.handleDraggedTechMapMove(offset, this.draggTechMapRect);
  }

  onDraggedTechMapFinishedDragging() {
    super.onDraggedTechMapFinishedDragging();
    this.handleDrop();
  }

  onDraggedTechMapLeft() {
    super.onDraggedTechMapLeft();
    this.handleDrop();
  }

  handleDrop() {
    if (this.canDrop) {
      this.stateActions.dropTechMapAction(
        this.techMapId,
        this.dropColumn,
        -1,
        this.draggedTechMapRectInTimeline.top
      );
      this.canDrop = false;
    }
  }
}
