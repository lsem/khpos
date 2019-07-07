import React from "react";
import Icon from "../Icon";
import { ICONS } from "../../constants/icons";
import Ingredient from "../../models/ingredients/ingredient";
import IngredientsRow from "../../models/techMaps/ingredientsRow";

type Props = {
  units: number[];
  ingredientsRow: IngredientsRow;
  ingredients: Ingredient[];
  row: number;
  removeRow: Function;
};

export const TechMapIngredientsDataRow: React.FC<Props> = (props) => {
  return (
    <div className="gridRowWrapper">
      <select
        style={{ gridRow: props.row, gridColumn: 2 }}
        className="techMapTextCell techMapDropDown"
        value={props.ingredientsRow.ingredientId}
      >
        {props.ingredients.map((ing, i) => (
          <option value={ing.id} key={i}>{ing.name}</option>
        ))}
      </select>

      {props.units.map((u, i) => (
        <input style={{ gridRow: props.row, gridColumn: i + 3 }}
          className="techMapTextCell"
          type="number"
          value={props.ingredientsRow.countByUnits.get(u)}
          key={i}/>
      ))}

      <button 
        className="techMapRoundButton1" 
        style={{ gridRow: props.row, gridColumn: -2 }}
        onClick={() => props.removeRow(props.ingredientsRow)}>
        <Icon icon={ICONS.MINUS} size={16} color="#ff3b30" />
      </button>

      <button className="techMapRoundButton1" style={{ gridRow: props.row, gridColumn: "1 / -1", marginBottom: -24 }}>
        <Icon icon={ICONS.ADD} size={16} color="#007aff" />
      </button>
    </div>
  );
}
