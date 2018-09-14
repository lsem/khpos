// https://github.com/react-dnd/react-dnd/issues/592

import "./CustomDragLayer.css";
import React from "react";
import { DragLayer } from "react-dnd";
import TechMapView from "./TechMapView";
import TimelinePanelListItem from "./TimelinePanelListItem";
import _ from "lodash";

// tips for future work: https://stackoverflow.com/questions/47500136/get-element-position-in-the-dom-on-react-dnd-drop
// http://rafaelquintanilha.com/sortable-targets-with-react-dnd/
// https://github.com/react-dnd/react-dnd/issues/591
// https://github.com/react-dnd/react-dnd/issues/151

function collect(monitor, props) {
  return {
    currentOffset: monitor.getSourceClientOffset(),
    clientOffset: monitor.getClientOffset(),
    initialClientOffset: monitor.getInitialClientOffset(),
    diffFromInitialOffset: monitor.getDifferenceFromInitialOffset(),
    isDragging: monitor.isDragging(),
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    canDrop: (() => {
      //console.log('can drop called')
      // Seems like it is the only way now to tell if we avobe drop target.
      // Here we inject "artificial" canDrop query to props which allows us
      // to know if draged item is hovering drop target.
      // TODO: Find a way to optimize this part since for now it called
      // every render function.
      // https://github.com/react-dnd/react-dnd/issues/448
      const queryCanDrop = monitor => {
        const targetIds = monitor.isDragging() ? monitor.getTargetIds() : [];
        for (let i = targetIds.length - 1; i >= 0; i--) {
          if (monitor.isOverTarget(targetIds[i])) {
            return monitor.canDropOnTarget(targetIds[i]);
          }
        }
        return false;
      };
      return queryCanDrop(monitor);
    })()
  };
}

function getItemTransform(props) {
  const { currentOffset } = props;
  if (!currentOffset) {
    return {
      display: "none"
    };
  }
  const { x, y } = currentOffset;
  //const transform = `translate(${x}px, ${y}px) rotate(0deg)`;

  return {
    zIndex: 100,
    position: "fixed",
    pointerEvents: "none",
    left: x,
    top: y
    //transform: transform,
    //WebkitTransform: transform
  };
}

// To further improve drag layer performance, consider making as in an article:
// https://habr.com/company/macte/blog/344368/
class CustomDragLayer extends React.PureComponent {
  constructor(props) {
    super(props);
    this.lastUpdate = +new Date();
    this.updateTimer = null;
  }

  shouldComponentUpdate(nextProps, nextState) {
    // This improves perforamnce but for some reason
    // in combination with PureComponent it in most cases leads to missing entering event
    // in current state of DND state management. Do not remove this
    // code until we fix this.
    return true;
    //if ((new Date() - this.lastUpdate) > (1000 / 60) /*60 fps*/) {
    //   this.lastUpdate = new Date();
    //   clearTimeout(this.updateTimer);
    //   return true;
    // } else {
    //   this.updateTimer = setTimeout(() => {
    //     this.forceUpdate();
    //   }, 50);
    // }
    // return false;
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.isDragging && nextProps.isDragging) {
      this.props.onTechMapPreviewStartedDragging();
    } else if (this.props.isDragging && !nextProps.isDragging) {
      this.props.onTechMapPreviewFinishedDragging();
    }
  }

  renderMaterializedTechMap(techMap) {
    // Manually specify dimensions related style attributes
    // to be the same as in chld TechMapView to be able request
    // this properties later by DOM element reference.
    const techMapViewWidth = 100; // TODO: get from model via props
    const layerStyle = getItemTransform(this.props);
    layerStyle.height = TechMapView.calcHeight(
      techMap,
      this.props.minsToPixels
    );
    layerStyle.width = techMapViewWidth;
    return (
      <div
        className="CustomDragLayer"
        style={layerStyle}
        ref={this.props.onTechMapPreviewDomNodeRefUpdate}
      >
        <TechMapView
          title={"Drag layer"}
          tintColor={techMap.tintColor}
          left={0}
          width={techMapViewWidth}
          top={0}
          key={"Drag layer"}
          minsToPixels={this.props.minsToPixels}
          tasks={techMap.tasks}
        />
      </div>
    );
  }
  renderUnmaterializedTechMap(techMap) {
    const layerStyle = getItemTransform(this.props);
    // todo: this does not work, needs to be removed/fixed.
    layerStyle.height = TechMapView.calcHeight(
      techMap,
      this.props.minsToPixels
    );
    layerStyle.width = 100; // TODO: get from model via props
    // TODO: in general it may not me TimelinePanelListItem but some other view representing
    // small item but in drag state.
    return (
      <div className="CustomDragLayer" style={layerStyle}>
        <TimelinePanelListItem itemDisplayName={techMap.name} />
      </div>
    );
  }

  render() {
    const { isDragging, item, itemType, canDrop } = this.props;

    if (!isDragging) {
      // Case when we instantiated DragLayer
      // not in dragging context, e.g. when we just instantiate this component
      // as static.
      return null;
    }

    const techMapSpec = _.find(
      this.props.techMapRegistry,
      x => x.id === item.techMapId
    );
    // TODO: handle not found case

    if (itemType === "techmap") {
      return this.renderMaterializedTechMap(techMapSpec);
    } else if (itemType === "techmap-panel-item") {
      if (canDrop) {
        return this.renderMaterializedTechMap(techMapSpec);
      } else {
        return this.renderUnmaterializedTechMap(techMapSpec);
      }
    } else {
      // todo: what does it mean? what should be a message
      console.log("WARNING: unknown item");
    }
  }
}

export default _.flow(DragLayer(collect))(CustomDragLayer);
