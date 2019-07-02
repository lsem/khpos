import React from "react";
import Icon from "../Icon";
import { ICONS } from "../../constants/icons";

export default function TechMapIngredientsDataRow(props) {
  return (
    <div className="gridRowWrapper">
      <select
        style={{ gridRow: props.row, gridColumn: 2 }}
        className="techMapTextCell techMapDropDown"
        value={props.ingredient.ingredientId}
      >
        {props.ingredients.map((ing, i) => (
          <option value={ing.id} key={i}>{ing.name}</option>
        ))}
      </select>

      {props.units.map((u, i) => (
        <input style={{ gridRow: props.row, gridColumn: i + 3 }}
          className="techMapTextCell"
          type="number"
          value={props.ingredient.countByUnits.get(u)}
          key={i}/>
      ))}

      <button 
        className="techMapRoundButton1" 
        style={{ gridRow: props.row, gridColumn: -2 }}
        onClick={() => props.removeRow('ingredients', props.ingredient)}>
        <Icon icon={ICONS.MINUS} size={16} color="#ff3b30" />
      </button>

      <button className="techMapRoundButton1" style={{ gridRow: props.row, gridColumn: "1 / -1", marginBottom: -24 }}>
        <Icon icon={ICONS.ADD} size={16} color="#007aff" />
      </button>
    </div>
  );
}
