import React, { PureComponent } from "react";
import TechMapTextCell from "./TechMapTextCell";
import Icon from "../Icon";
import { ICONS } from "../../constants/icons";

export default class TechMapHumanResourcesDataRow extends PureComponent {
  render() {
    return (
      <div className="gridRowWrapper">
        <TechMapTextCell
          value={this.props.humanResource.count}
          column={2}
          row={this.props.row}
          type="int"
        />

        {this.props.units.map((u, i) => (
          <TechMapTextCell
            value={this.props.humanResource.timeNormsByUnit[u]}
            column={i + 3}
            row={this.props.row}
            key={i}
            type="int"
          />
        ))}

        <button className="techMapRoundButton1" style={{ gridRow: this.props.row, gridColumn: -2 }}>
          <Icon icon={ICONS.MINUS} size={16} color="#ff3b30" />
        </button>

        <button className="techMapRoundButton1" style={{ gridRow: this.props.row, gridColumn: "1 / -1", marginBottom: -24 }}>
          <Icon icon={ICONS.ADD} size={16} color="#007aff" />
        </button>
      </div>
    );
  }
}
