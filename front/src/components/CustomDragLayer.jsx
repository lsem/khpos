// https://github.com/react-dnd/react-dnd/issues/592

import React from "react";
import { DragLayer } from "react-dnd";
import TechMapView from "./TechMap";
import TimelinePanelListItem from "./PlanListItem";
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
            console.log('CAN DROP!')
            return monitor.canDropOnTarget(targetIds[i]);
          }
        }
        return false;
      };
      return queryCanDrop(monitor);
    })()
  };
}

function getItemTransform(offset) {
  if (!offset) {
    console.warn('getItemTransform: No offset')
    return {
      display: "none"
    };
  }
  // todo: get back using transform instead of left, top
  //const transform = `translate(${offset.x}px, ${offset.y}px) rotate(0deg)`
  return {
    zIndex: 100,
    position: "fixed",
    pointerEvents: "none",
    left: offset.x,
    top: offset.y
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

  // shouldComponentUpdate cannot be used with React so it is disabled.
  // shouldComponentUpdate(nextProps, nextState) {
  //   // This improves perforamnce but for some reason
  //   // in combination with PureComponent it in most cases leads to missing entering event
  //   // in current state of DND state management. Do not remove this
  //   // code until we fix this.
  //   return true;
  //   //if ((new Date() - this.lastUpdate) > (1000 / 60) /*60 fps*/) {
  //   //   this.lastUpdate = new Date();
  //   //   clearTimeout(this.updateTimer);
  //   //   return true;
  //   // } else {
  //   //   this.updateTimer = setTimeout(() => {
  //   //     this.forceUpdate();
  //   //   }, 50);
  //   // }
  //   // return false;
  // }

  componentWillReceiveProps(nextProps) {
    if (!this.props.isDragging && nextProps.isDragging) {
      this.props.onTechMapPreviewStartedDragging(
        nextProps.item,
        nextProps.itemType
      );
    } else if (this.props.isDragging && !nextProps.isDragging) {
      this.props.onTechMapPreviewFinishedDragging();
    }
  }

  renderMaterializedTechMap(techMap) {
    console.log('RENDERING TECHMAP: ', techMap);
    // Manually specify dimensions related style attributes
    // to be the same as in chld TechMapView to be able request
    // this properties later by DOM element reference.
    const techMapViewWidth = 100; // TODO: get from model via props
    const effectiveOffset = this.props.currentOffset;
    if (effectiveOffset && this.props.draggedTechMapHorizontalLock) {
      effectiveOffset.x = this.props.draggedTechMapHorizontalLock;
    }
    const layerStyle = getItemTransform(effectiveOffset);
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
          innerRef={node => void 0} // todo: this can be used instand of taking node from parent native dom node
        />
      </div>
    );
  }
  renderUnmaterializedTechMap(techMap) {
    const layerStyle = getItemTransform(this.props.currentOffset);
    // todo: this does not work, needs to be removed/fixed.
    layerStyle.height = TechMapView.calcHeight(
      techMap,
      this.props.minsToPixels
    );
    layerStyle.width = 100; // TODO: get from model via props
    // TODO: in general it may not me PlanListItem but some other view representing
    // small item but in drag state.
    console.log('UNMATERIALIZED TECHMAP: ', techMap)
    console.log('UNMATERIALIZED STYLE: ', layerStyle)
    return (
      <div className="CustomDragLayer" style={layerStyle}>
        <TimelinePanelListItem itemDisplayName={techMap.name} />
      </div>
    );
  }

  getTechMapSpec(item, itemType) {
    if (itemType === "techmap") {
      const job = _.find(this.props.jobs, x => x.id === item.jobId);
      if (job) {
        return job.techMap;
      } else {
        return null;
      }
    } else {
      console.log('item.techMapId: ', item.techMapId)
      console.log('this.props.techMaps: ', this.props.techMaps)
      // panel item
      return _.find(this.props.techMaps, x => x.id === item.techMapId);
    }
  }

  render() {
    const { isDragging, item, itemType, canDrop } = this.props;

    if (!isDragging) {
      // Case when we instantiated DragLayer
      // not in dragging context, e.g. when we just instantiate this component
      // as static.
      return null;
    }

    const techMapSpec = this.getTechMapSpec(item, itemType);

    // TODO: handle not found case
    if (!techMapSpec) {
      console.error("Failed to find tech map spec");
    }

    if (itemType === "techmap") {
      return this.renderMaterializedTechMap(techMapSpec);
    } else if (itemType === "techmap-panel-item") {
      console.log("!!!");
      if (canDrop) {
        console.log("!!! (1)");
        return this.renderMaterializedTechMap(techMapSpec);
      } else {
        console.log("!!! (2)");
        return this.renderUnmaterializedTechMap(techMapSpec);
      }
    } else {
      // todo: what does it mean? what should be a message
      console.log("WARNING: unknown item");
    }
  }
}

export default _.flow(DragLayer(collect))(CustomDragLayer);
