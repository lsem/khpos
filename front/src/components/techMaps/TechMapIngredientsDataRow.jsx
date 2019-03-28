import React, { PureComponent } from "react";
import TechMapTextCell from "./TechMapTextCell";
import Icon from "../Icon";
import { ICONS } from "../../constants/icons";

export default class TechMapIngredientsDataRow extends PureComponent {
  render() {
    return (
      <div className="gridRowWrapper">
        <select
          style={{ gridRow: this.props.row, gridColumn: 2 }}
          className="techMapTextCell techMapDropDown"
          defaultValue={this.props.ingredient.id}
        >
          {this.props.ingredients.map((ing, i) => (
            <option value={ing.id} key={i}>{ing.name}</option>
          ))}
        </select>

        {this.props.units.map((u, i) => (
          <TechMapTextCell
            value={this.props.ingredient.countByUnits[u]}
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

        <button className="techMapRoundButton1" style={{ gridRow: this.props.row, gridColumn: "1 / -1", marginBottom: -24 }}>
          <Icon icon={ICONS.ADD} size={16} color="#007aff" />
        </button>
      </div>
    );
  }
}
