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
    this.movedJob = null;
    this.moveSwapDragging = true;
    this.lastColumnHit = null;
    this.horizontalLockXOffset = null;
  }

  onShiftPressed(isPressed) {
    // this state will not be passed to constuctors but live only here
    // so after state transition happens shift will be lost.
    if (isPressed) {
      this.lockDragHorizontalMove(this.horizontalLockXOffset);
    } else {
      this.unlockDragHorizontalMove();
    }
  }

  onTechMapAttached(techMapId, jobId, rect, column, row) {
    super.onTechMapAttached(techMapId, jobId, rect, column, row);
    if (this.itemType !== DragItemTypes.TIMELINE_TECHMAP) {
      // no lock required
      return;
    }
    if (!this.needsHorizontalLock) {
      return;
    }
    // it was already locked before, lets check if columns did not change
    if (!_.isEqual(this.prevColumnRects, this.columnRects)) {
      // changed, needs to be relocked
      // todo: lock to column offset instead of rect left.
      this.lockDragHorizontalMove(
        this.getCurrentElementInitialRect()
          ? this.getCurrentElementInitialRect().left
          : null
      );
      this.horizontalMoveLocked = true;
    } else {
      console.log("NO NEED TO LOCK");
      // not changed, do nothing
    }
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

  lockDragHorizontalMove(leftOffsetToLockTo) {
    if (!leftOffsetToLockTo) {
      console.error("lockDraggedTechMapToVerticalMove: No leftOffsetToLockTo");
      return;
    }
    this.stateActions.lockDragHorizontalMove(leftOffsetToLockTo);
  }

  unlockDragHorizontalMove() {
    this.stateActions.lockDragHorizontalMove(null);
  }

  findColumnUnderPos(pos) {
    const columnHit = _.find(
      _.map(this.columnRects, (rect, index) => [index, rect]),
      x => posInRect(pos, x[1])
    );
    if (!columnHit) {
      return null;
    }
    return columnHit[0];
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
    // Track hovered column
    const columnHit = this.findColumnUnderPos(cursorPos);
    if (columnHit !== this.lastColumnHit) {
      this.lastColumnHit = columnHit;
      this.stateActions.columnHovered(columnHit);
    }

    // Teset what kind of dragging event we have
    // it might be either dragging new item to timline
    // or dragging existing one.
    if (this.itemType === DragItemTypes.TIMELINE_TECHMAP) {
      this.moveSwapDragging = true;

      // Column of dragged tech map can be taken from this.item.colIndex,
      // but could be over another column at this moment.
      const column = this.findColumnUnderPos(cursorPos);
      if (!column) {
        // must be between two adjacent columns.
        return;
      }

      const currentColumnRect = this.columnRects[columnHit];
      this.horizontalLockXOffset = currentColumnRect.left;

      // Cut off trivial case when have no tech maps in the column
      if (!this.columnTechMaps[column]) {
        this.canDrop = true;
        this.dropColumn = column;
        return;
      }

      // Identify overlaps
      const columnTechMaps = Object.values(this.columnTechMaps[column]);
      const foundOverlap = _.find(columnTechMaps, x => {
        return (
          overlap(
            x.rect.top,
            x.rect.bottom,
            draggedTechMapRect.top,
            draggedTechMapRect.bottom
          ) && this.item.jobId !== x.jobId
        );
      });

      if (!foundOverlap) {
        // no overlap drop possible
        this.canDrop = true;
        this.dropColumn = column;
        return;
      }

      // Handling overlap
      const draggedTechMap = _.find(
        columnTechMaps,
        x => x.jobId == this.item.jobId
      );
      if (!draggedTechMap) {
        console.error("No draggedTechMap");
        return;
      }

      const draggredRect = draggedTechMap.rect;

      const middleY = (foundOverlap.rect.bottom + foundOverlap.rect.top) / 2;

      // cut off cases when swap not needed
      if (draggredRect.top > foundOverlap.rect.top && cursorPos.y > middleY) {
        return;
      }
      if (draggredRect.top < foundOverlap.rect.top && cursorPos.y < middleY) {
        return;
      }

      // Handle swaps
      this.stateActions.swapTechMaps(
        column,
        draggedTechMap.jobId,
        foundOverlap.jobId
      );
    } else if (this.itemType === DragItemTypes.SIDEBAR_TECHMAP) {
      this.moveSwapDragging = false;

      // test for column hit (can be done in window coordinates)
      const columnHit = _.find(
        _.map(this.columnRects, (rect, index) => [index, rect]),
        x => posInRect(cursorPos, x[1])
      );
      if (!columnHit) {
        return;
      }
      const column = columnHit[0];

      // Handle trivial case when column is free
      if (!this.columnTechMaps[column]) {
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
    this.lastColumnHit = null;
    this.stateActions.columnHovered(null);
    if (this.canDrop) {
      this.canDrop = false;
      if (this.moveSwapDragging) {
        this.stateActions.moveJob(
          this.item.jobId,
          this.dropColumn,
          this.draggedTechMapRectInTimeline.top
        );
      } else {
        this.stateActions.dropTechMapAction(
          this.techMapId,
          this.dropColumn,
          -1,
          this.draggedTechMapRectInTimeline.top
        );
      }
    }
  }
}
