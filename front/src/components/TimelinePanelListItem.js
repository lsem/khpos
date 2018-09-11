import "./TimelinePanelListItem.css";
import React from "react";
import { DragSource } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import ReactDOMServer from "react-dom/server";
import "./TechMapView.css";

class TechMapPreview extends React.Component {
  render() {
    const techMapStyle = {
      width: this.props.width,
      height: this.props.queryTechMapHeight(this.props.techMapId),
      left: this.props.left,
      top: this.props.top,
      border: "solid black 1px",
      backgroundColor: this.props.kind === "small" ? "red" : "yellow"
    };

    return (
      <div className="TechMapPreview" style={techMapStyle}>
        <h2> {this.props.itemDisplayName} </h2>
      </div>
    );
  }
}

function generatePlaceholder(props) {
  //console.log("generating placeholder: ", props);
  const placeholder = document.createElement("div");
  placeholder.id = "drag-placeholder";
  placeholder.style.cssText =
    "display:none;position:fixed;z-index:100000;pointer-events:none;";
  placeholder.style.height = props.queryTechMapHeight(props.techMapId) + "px";
  placeholder.style.width = "100px";
  placeholder.innerHTML = ReactDOMServer.renderToStaticMarkup(
    <TechMapPreview {...props} />
  );
  return placeholder;
}

function generateSmallPlaceholder(props) {
  //console.log("generating placeholder: ", props);
  const placeholder = document.createElement("div");
  placeholder.id = "drag-placeholder-small";
  placeholder.style.cssText =
    "display:none;position:fixed;z-index:100000;pointer-events:none;";
  placeholder.style.height = props.queryTechMapHeight(props.techMapId) + "px";
  placeholder.style.width = "100px";
  placeholder.innerHTML = ReactDOMServer.renderToStaticMarkup(
    <TechMapPreview {...props} kind={"small"}/>
  );
  return placeholder;
}


function createMouseMoveHandler(props) {
  let currentX = -1;
  let currentY = -1;

  return function(event) {
    console.log('mouse: isHover: ', props.isHover())

    let newX = event.clientX - 8;
    let newY = event.clientY - 2;

    if (currentX === newX && currentY === newY) {
      return;
    }

    let dragPlaceholder = document.getElementById("drag-placeholder");
    //let dragPlaceholder = document.getElementById("drag-placeholder-small");

    const transform = "translate(" + newX + "px, " + newY + "px)";

    dragPlaceholder.style.transform = transform;
    dragPlaceholder.style.display = "block";
  };
}

let mouseMoveHandler;// = createMouseMoveHandler();

class TimelinePanelListItem extends React.Component {
  // Needed for react-dnd
  componentDidMount() {
    // Use empty image as a drag preview so browsers don't draw it
    // and we can draw whatever we want on the custom drag layer instead
    this.props.connectDragPreview(getEmptyImage());
    //this.props.connectDragPreview();
    console.log("props: ", this.props);
  }
  render() {
    const style = {
      opacity: this.props.isDragging ? 0 : 1 // todo: seems like this not neded, but needs to be checked
    };
    // TODO: refactor this (consider having identity decorator).
    if (this.props.isDraggableItem) {
      return this.props.connectDragSource(
        <ul className="TimelinePanelListItem" style={style}>
          {this.props.itemDisplayName}
        </ul>
      );
    } else {
      return (
        <ul className="TimelinePanelListItem" style={style}>
          {this.props.itemDisplayName}
        </ul>
      );
    }
  }
}

// Needed for react-dnd
export default DragSource(
  "techmap-panel-item",
  // source:
  {
    // component: TimelinePanelListItem
    // monitor: SoourceMonitor
    // props: Properties of component
    beginDrag(props, monitor, component) {
      // Generaet placeholder preview, that is snapshoted by HTML5 backend
      console.log('BEGIN DRAP: props: ', props)
      const placeholder = generatePlaceholder(props);
      const smallPlaceholder = generateSmallPlaceholder(props);
      mouseMoveHandler = createMouseMoveHandler(props);
      document.addEventListener("dragover", mouseMoveHandler);
      document.body.insertBefore(placeholder, document.body.firstChild);
      document.body.insertBefore(smallPlaceholder, document.body.firstChild);

      // console.log("rect: ", placeholder.getBoundingClientRect());

      // Create item
      const item = {
        techMapId: props.techMapId
      };

      // Report to parent dragging begin event
      props.onDndDragBegin(item);

      return item;
    },
    endDrag(props, monitor, component) {
      document.removeEventListener("dragover", mouseMoveHandler);
      let child = document.getElementById("drag-placeholder");
      child.parentNode.removeChild(child);
    }
  }, // collect:
  (connect, monitor) => {
    return {
      connectDragSource: connect.dragSource(),
      isDragging: monitor.isDragging(),
      connectDragPreview: connect.dragPreview()
    };
  }
)(TimelinePanelListItem);
