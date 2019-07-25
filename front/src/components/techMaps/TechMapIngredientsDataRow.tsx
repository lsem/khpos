import React from "react";
import Icon from "../Icon";
import { ICONS } from "../../constants/icons";
import Ingredient from "../../models/ingredients/ingredient";
import IngredientsRow from "../../models/techMaps/ingredientsRow";
import { TechMapCell } from "./TechMapCell";

type Props = {
  units: number[];
  ingredientsRow: IngredientsRow;
  ingredients: Ingredient[];
  row: number;
  removeClick: () => void;
  addClick: () => void;
  updateCell: (unit: number, value: number) => void;
  changeIngredient: (ingredientId: string) => void;
};

export const TechMapIngredientsDataRow: React.FC<Props> = props => {
  return (
    <div className="gridRowWrapper">
      <select
        style={{ gridRow: props.row, gridColumn: 2 }}
        className="techMapTextCell techMapDropDown"
        value={props.ingredientsRow.ingredientId}
        onChange={e => props.changeIngredient(e.target.value)}
      >
        {props.ingredients.map((ing, i) => (
          <option value={ing.id} key={i}>
            {ing.name}
          </option>
        ))}
      </select>

      {props.units.map((u, i) => (
        <TechMapCell 
          row={props.row}
          column={i + 3}
          inputType="number"
          initialValue={"" + props.ingredientsRow.countByUnits.get(u)}
          onBlur={e => props.updateCell(u, +e.target.value)}
          key={i}
        />
      ))}

      <button
        className="techMapRoundButton1"
        style={{ gridRow: props.row, gridColumn: -2 }}
        onClick={() => props.removeClick()}
      >
        <Icon icon={ICONS.MINUS} size={16} color="#ff3b30" />
      </button>

      <button
        className="techMapRoundButton1"
        style={{ gridRow: props.row, gridColumn: "1 / -1", marginBottom: -24 }}
        onClick={() => props.addClick()}
      >
        <Icon icon={ICONS.ADD} size={16} color="#007aff" />
      </button>
    </div>
  );
};
