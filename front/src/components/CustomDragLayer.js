// https://github.com/react-dnd/react-dnd/issues/592

import "./CustomDragLayer.css";
import React from "react";
import { DragLayer } from "react-dnd";
import TechMapView from "./TechMapView";
import TimelinePanelListItem from "./TimelinePanelListItem";

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
    itemBeingDragged: monitor.getItem(),
    componentType: monitor.getItemType(),
    canDrop: (() => {
      //console.log('can drop called')
      // Seems like it is the only way now to tell if we avobe drop target.
      // Here we inject "artificial" canDrop query to props which allows us
      // to know if draged item is hovering drop target.
      // TODO: Find a way to optimize this part since for now it called
      // every render function.
      // https://github.com/react-dnd/react-dnd/issues/448
      const queryCanDrop = (monitor) => {
        const targetIds = monitor.isDragging() ? monitor.getTargetIds() : [];
        for (let i = targetIds.length - 1; i >= 0; i--) {
          if (monitor.isOverTarget(targetIds[i])) {
            return monitor.canDropOnTarget(targetIds[i]);
          }
        };
        return false;
      }
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
class CustomDragLayer extends React.Component {
  constructor(props) {
    super(props);
    this.techMapViewRef = null;
    this.lastUpdate = +new Date();
    this.updateTimer = null;
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true;
    if ((+new Date() - this.lastUpdate) > (1000 / 60) /*60 fps*/) {
      this.lastUpdate = +new Date();
      clearTimeout(this.updateTimer);
      return true;
    } else {
      this.updateTimer = setTimeout(() => {
        this.forceUpdate();
      }, 50);
    }
    return false;
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.isDragging && nextProps.isDragging) {
      this.props.onTechMapPreviewStartedDragging()
    } else if (this.props.isDragging && !nextProps.isDragging) {
      this.props.onTechMapPreviewFinishedDragging()
    }
  }

  renderMaterializedTechMap(itemProps) {
    // Manually specify dimensions related style attributes
    // to be the same as in chld TechMapView to be able request
    // this properties later by DOM element reference.
    const techMapViewWidth = 100; // TODO: get from model via props
    const layerStyle = getItemTransform(this.props);
    const dragLayerStyle = Object.assign({}, layerStyle, {
      height: itemProps.height,
      width: techMapViewWidth
    });
    return (
      <div
        className="CustomDragLayer"
        style={dragLayerStyle}
        ref={x => (this.techMapViewRef = x)}
      >
        <TechMapView
          title={"Drag layer"}
          tintColor={itemProps.tintColor}
          height={itemProps.height}
          left={0}
          width={techMapViewWidth}
          top={0}
          key={"Drag layer"}
        />
      </div>
    );
  }
  renderUnmaterializedTechMap(itemProps) {
    const techMapViewWidth = 100; // TODO: get from model via props
    const layerStyle = getItemTransform(this.props);
    const dragLayerStyle = Object.assign({}, layerStyle, {
      height: itemProps.height,
      width: techMapViewWidth
    });

    return (
      <div
        className="CustomDragLayer"
        // style={getItemTransform(this.props)}
        style={dragLayerStyle}
        ref={x => (this.techMapViewRef = x)}
      >
        {/*Render hidden view to have rect*/}
        <TechMapView
          hidden={true}
          title={"Drag layer"}
          tintColor={itemProps.tintColor}
          height={itemProps.height}
          left={0}
          width={techMapViewWidth}
          top={0}
          key={"Drag layer"}
        />

        <TimelinePanelListItem itemDisplayName="Dray layer (panel item)" />
      </div>
    );
  }

  render() {
    const { isDragging, itemBeingDragged, componentType, canDrop } = this.props;

    if (!isDragging) {
      // Case when we instantiated DragLayer
      // not in dragging context, e.g. when we just instantiate this component
      // as static.
      return null;
    }

    if (componentType === "techmap") {
      return this.renderMaterializedTechMap(itemBeingDragged);
    } else if (componentType === "techmap-panel-item") {
      if (canDrop) {
        return this.renderMaterializedTechMap({
          // temporarly hard coded value
          tintColor: "rgba(100, 200, 100, 1.0)",
          height: 200
        });
      } else {
        return this.renderUnmaterializedTechMap({
          // temporarly hard coded value
          smallView: true,
          tintColor: "rgba(100, 200, 100, 1.0)",
          height: 200
        });
      }
    } else {
      console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    }
  }
}

export default DragLayer(collect)(CustomDragLayer);
