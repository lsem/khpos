import React, { PureComponent } from "react";
import TechMapTextCell from "./TechMapTextCell";
import Icon from "../Icon";
import { ICONS } from "../../constants/icons";

export default class TechMapInventoryDataRow extends PureComponent {
  render() {
    return (
      <div className="gridRowWrapper">
        <select
          style={{ gridRow: this.props.row, gridColumn: 2 }}
          className="techMapTextCell techMapDropDown"
          defaultValue={this.props.invent.id}
        >
          {this.props.inventory.map((inv, i) => (
            <option value={inv.id} key={i}>{inv.name}</option>
          ))}
        </select>

        {this.props.units.map((u, i) => (
          <TechMapTextCell
            value={this.props.invent.countByUnits[u]}
            column={i + 3}
            row={this.props.row}
            isFirst={!i}
            key={i}
            type="int"
          />
        ))}

        <button className="techMapRoundButton1" style={{ gridRow: this.props.row, gridColumn: -2 }}>
          <Icon icon={ICONS.MINUS} size={16} color="#ff3b30" />
        </button>
      </div>
    );
  }
}
