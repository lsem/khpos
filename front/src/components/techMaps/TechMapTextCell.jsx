import React, { PureComponent } from "react";

export default class TechMapTextCell extends PureComponent {
  render() {
    const handleInput = (e) => {
      switch(this.props.type) {
        case "int" : {
          // e.target.innerText = e.target.innerText.replace(/[^\d].+/, "");

          if ((e.charCode < 48 || e.charCode > 57)) {
            e.preventDefault();
          }
        }

        default: return false;
      }
    }

    return (
      <div style={{ gridRow: this.props.row, gridColumn: this.props.column }}
        suppressContentEditableWarning
        className="techMapTextCell" 
        contentEditable="true"
        onKeyPress={handleInput}
        onKeyUp={handleInput}
        onBlur={handleInput}>
        {this.props.value}
      </div>
    )
  }
}
