import StateBase from "./StateBase";

export default class extends StateBase {
  constructor(factory, nextState, commonState, stateActions) {
    super(factory, nextState, commonState);
    this.stateActions = stateActions;
    this.timelineRect = null;
    this.id = null;
    this.item = null;
    this.itemType = null;
    this.rect = null;
    this.initialOffset = null;
  }

  getName() {
    return "Idle";
  }

  idleToDraggingIfPossible() {
    if (this.techMapId && this.rect) {
      // todo: initialize new state
      this.nextState(
        this.factory.makeDraggingState(
          this.factory,
          this.nextState,
          this.techMapId,
          this.item,
          this.itemType,
          this.rect,
          this.initialOffset
        )
      );
    }
  }

  onDraggedTechMapEntered(id, initialOffset) {
    this.techMapId = id;
    this.initialOffset = initialOffset;
    this.idleToDraggingIfPossible();
  }

  onDraggedTechMapStartedDragging(item, itemType) {
    this.item = item;
    this.itemType = itemType;
  }

  onDraggedTechMapGotRect(rect) {
    //super.onDraggedTechMapGotRect(rect)
    this.rect = rect;
    this.idleToDraggingIfPossible();
  }
}
