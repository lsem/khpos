// https://gist.github.com/andersfly/25ab13dbd1acc5eb915f

import pick from "lodash/pick";
import bindAll from "lodash/bindAll";

const MODIFIER_KEYS = ["ctrlKey", "shiftKey", "altKey", "metaKey"];

/**
 * Detects drag modifier keys on drag events that originated
 * from the wrapped component
 *
 * @param {boolean} options.listenForAllDragEvents
 *   if true it will detect modifier keys for all drag events, and not
 *   just the ones originating from the wrapped component
 */
export default class {
  constructor(onModifierKeyChanged) {
    this.onModifierKeyChanged = onModifierKeyChanged;
    bindAll(this, "onDrag", "onDragStart", "onDragEnd");
    this.dragModifierKeys = MODIFIER_KEYS.reduce((mem, key) => {
      mem[key] = false;
      return mem;
    }, {});
  }

  componentDidMount(event) {
    window.addEventListener("dragstart", this.onDragStart);
    window.addEventListener("dragend", this.onDragStart);
    // The 'drag' event doesn't detect modifier keys in FF for some reason.
    // Therefore we listen for dragover on the window instead, which roughly
    // gives the same result
    window.addEventListener("dragover", this.onDrag);
  }

  componentWillUnmount(event) {
    window.removeEventListener("dragstart", this.onDragStart);
    window.removeEventListener("dragend", this.onDragEnd);
    window.removeEventListener("dragover", this.onDrag);
  }

  onDragStart(event) {
    // Determine whether or not the the drag event
    // originated from inside the wrapped component
    // this._isDragOrigin = ReactDOM.findDOMNode(this._wrapped).contains(
    //   event.target
    // );
  }

  onDragEnd(event) {
    // this._isDragOrigin = false;
  }

  onDrag(event) {
    if (true) {
      const hasChanged = Object.keys(this.dragModifierKeys).some(key => {
        return this.dragModifierKeys[key] !== event[key];
      });

      if (hasChanged) {
        this.dragModifierKeys = pick(event, MODIFIER_KEYS);
        this.onModifierKeyChanged(this.dragModifierKeys);
      }
    }
  }
}
