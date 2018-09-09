import "./TechMapView.css";
import React from "react";
import { DragSource, DropTarget } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import _ from "lodash";
import classNames from "classnames";
import ReactDOMServer from "react-dom/server";

class TechMapViewContent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const techMapStyle = {
      width: this.props.width,
      height: this.props.height,
      backgroundColor: this.props.tintColor,
      left: this.props.left,
      top: this.props.top,
      display: this.props.hidden ? "none" : "flex"
    };

    let className = classNames({
      TechMapView: true,
      "TechMapView-isOver": this.props.isOver
    });

    return (
      <div className={className} style={techMapStyle}>
        {this.props.title}
      </div>
    );
  }
}

function generatePlaceholder(item) {
  const placeholder = document.createElement("div");
  placeholder.id = "drag-placeholder";
  placeholder.style.cssText =
    "display:block;position:fixed;z-index:100000;pointer-events:none;";
  placeholder.innerHTML = ReactDOMServer.renderToStaticMarkup(
    <TechMapViewContent {...item} />
  );
  return placeholder;
}

function createMouseMoveHandler() {
  let currentX = -1;
  let currentY = -1;

  return function(event) {
    // console.log('event.clientX: ', event.clientX)
    // console.log('event.clientY: ', event.clientY)
    let newX = event.clientX - 8;
    let newY = event.clientY - 2;

    if (currentX === newX && currentY === newY) {
      return;
    }

    const dragPlaceholder = document.getElementById("drag-placeholder");
    const transform = "translate(" + newX + "px, " + newY + "px) rotate(3deg)";

    dragPlaceholder.style.transform = transform;
    dragPlaceholder.style.display = "block";
  };
}

const mouseMoveHandler = createMouseMoveHandler();
const throtteledMoveHandler = _.throttle(mouseMoveHandler, 16);

const techMapViewSource = {
  beginDrag(props, monitor, component) {
    console.log("BEGIN DRAG!");
    document.addEventListener("dragover", throtteledMoveHandler);
    console.log("insering preview!: ", generatePlaceholder(props));
    document.body.insertBefore(
      generatePlaceholder(props),
      document.body.firstChild
    );
    let cb;
    const result = {
      ...props,
      component,
      setQuerySize: x => (cb = x),
      querySize: () => cb()
    };
    return result;
  },
  endDrag(props, monitor, component) {
    document.removeEventListener("dragover", throtteledMoveHandler);
    let child = document.getElementById("drag-placeholder");
    child.parentNode.removeChild(child);

    if (!monitor.didDrop()) {
      return;
    }
    // const item = monitor.getItem();
    // const dropResult = monitor.getDropResult();

    // props.moveSubject(item.data.ID, {
    //   day: dropResult.xPos,
    //   period: dropResult.yPos,
    // });
  }
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
    connectDragPreview: connect.dragPreview()
  };
}

class TechMapView extends React.Component {
  componentDidMount() {
    // Use empty image as a drag preview so browsers don't draw it
    // and we can draw whatever we want on the custom drag layer instead
    this.props.connectDragPreview(getEmptyImage());
    this.nodeRef = null;
  }
  render() {
    const { connectDropTarget, connectDragSource, isDragging } = this.props;
    return connectDropTarget(
      connectDragSource(
        <div className="TechMapView">
          <TechMapViewContent {...this.props} ref={x => (this.nodeRef = x)}>
            {this.props.title}
          </TechMapViewContent>
        </div>
      )
    );
  }
}

const techMapDropTargetSpec = {
  hover(props, monitor, component) {
    // todo: not needed anymore?
    if (monitor.isOver()) {
      // const draggedTechMapView = component.getDecoratedComponentInstance();
      // const hoverBoundingRect = draggedTechMapView.nodeRef.getBoundingClientRect();
      //console.log(draggedTechMapView.nodeRef.getBoundingClientRect());
    }
  }
};
function techMapDropCollect(connect, monitor) {
  return {
    canDrop: monitor.canDrop(),
    isOver: monitor.isOver(),
    connectDropTarget: connect.dropTarget()
  };
}
export default _.flow(
  DragSource("techmap", techMapViewSource, collect),
  DropTarget("techmap", techMapDropTargetSpec, techMapDropCollect)
)(TechMapView);
