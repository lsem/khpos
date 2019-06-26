import React, { PureComponent } from "react";
import Icon from "../Icon";

export default class TechMapStepSectionHeader extends PureComponent {
  render() {
    const row = this.props.row;

    return (
      <React.Fragment>
        <div className="techMapStepSectionHeaderBg" style={{gridColumn: "2 / -2", gridRow: row}} />
        <div className="techMapStepSectionHeader" style={{gridColumn: "2", gridRow: row}}>
          <Icon size={16} color="rgba(0,0,0,.5)" icon={this.props.icon}/>
          {this.props.name}
        </div>
        <div className="techMapStepSectionDescription" style={{gridColumn: "3 / -2", gridRow: row}}>
          {this.props.description}
        </div>
      </React.Fragment>
    )
  }
}
