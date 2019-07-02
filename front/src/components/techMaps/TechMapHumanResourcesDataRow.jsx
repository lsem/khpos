import React from "react";
import Icon from "../Icon";
import { ICONS } from "../../constants/icons";

export default function TechMapHumanResourcesDataRow(props) {
  return (
    <div className="gridRowWrapper">
      <input style={{ gridRow: props.row, gridColumn: 2 }}
        className="techMapTextCell"
        type="number"
        value={props.humanResources.peopleCount}
        min={1}/>

      {props.units.map((u, i) => (
        <input style={{ gridRow: props.row, gridColumn: i + 3 }}
          className="techMapTextCell"
          type="number"
          value={props.humanResources.timeNormsByUnits.get(u)}
          key={i}/>
      ))}

      <button 
        className="techMapRoundButton1" 
        style={{ gridRow: props.row, gridColumn: -2 }}
        onClick={() => props.removeRow('humanResources', props.humanResources)}>
        <Icon icon={ICONS.MINUS} size={16} color="#ff3b30" />
      </button>

      <button className="techMapRoundButton1" style={{ gridRow: props.row, gridColumn: "1 / -1", marginBottom: -24 }}>
        <Icon icon={ICONS.ADD} size={16} color="#007aff" />
      </button>
    </div>
  );
}
