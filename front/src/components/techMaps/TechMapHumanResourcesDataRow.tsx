import React from "react";
import Icon from "../Icon";
import { ICONS } from "../../constants/icons";
import HumanResourcesRow from "../../models/techMaps/humanResourcesRow";
import { TechMapCell } from "./TechMapCell";

type Props = {
  units: number[];
  humanResourcesRow: HumanResourcesRow;
  row: number;
  removeClick: () => void;
  addClick: () => void;
  updateCell: (unit: number, value: number) => void;
  changePeopleCount: (peopleCount: number) => void;
};

export const TechMapHumanResourcesDataRow: React.FC<Props> = props => {
  return (
    <div className="gridRowWrapper">
      <TechMapCell
        row={props.row}
        column={2}
        inputType="number"
        initialValue={"" + props.humanResourcesRow.peopleCount}
        onBlur={e => props.changePeopleCount(+e.target.value)}
      />

      {props.units.map((u, i) => (
        <TechMapCell
          row={props.row}
          column={i + 3}
          inputType="number"
          initialValue={"" + props.humanResourcesRow.countByUnits.get(u)}
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
