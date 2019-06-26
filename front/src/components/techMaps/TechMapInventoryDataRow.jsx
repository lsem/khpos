import React from "react";
import Icon from "../Icon";
import { ICONS } from "../../constants/icons";

export default function TechMapInventoryDataRow(props) {
  return (
    <div className="gridRowWrapper">
      <select
        style={{ gridRow: props.row, gridColumn: 2 }}
        className="techMapTextCell techMapDropDown"
        defaultValue={props.invent.id}
      >
        {props.inventory.map((inv, i) => (
          <option value={inv.id} key={i}>{inv.name}</option>
        ))}
      </select>

      {props.units.map((u, i) => (
        <input style={{ gridRow: props.row, gridColumn: i + 3 }}
          className="techMapTextCell"
          type="number"
          defaultValue={props.invent.countByUnits[u]}
          key={i}/>
      ))}

      <button 
        className="techMapRoundButton1" 
        style={{ gridRow: props.row, gridColumn: -2 }}
        onClick={() => props.removeRow('inventory', props.invent)}>
        <Icon icon={ICONS.MINUS} size={16} color="#ff3b30" />
      </button>

      <button className="techMapRoundButton1" style={{ gridRow: props.row, gridColumn: "1 / -1", marginBottom: -24 }}>
        <Icon icon={ICONS.ADD} size={16} color="#007aff" />
      </button>
    </div>
  );
}
