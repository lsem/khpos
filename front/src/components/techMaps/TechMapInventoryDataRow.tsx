import React from "react";
import Icon from "../Icon";
import { ICONS } from "../../constants/icons";
import Device from "../../models/inventory/device";
import EquipmentRow from "../../models/techMaps/equipmentRow";
import { TechMapCell } from "./TechMapCell";

type Props = {
  units: number[];
  equipmentRow: EquipmentRow;
  devices: Device[];
  row: number;
  removeClick: () => void;
  addClick: () => void;
  updateCell: (unit: number, value: number) => void;
  changeDevice: (ingredientId: string) => void;
};

export const TechMapInventoryDataRow: React.FC<Props> = props => {
  return (
    <div className="gridRowWrapper">
      <select
        style={{ gridRow: props.row, gridColumn: 2 }}
        className="techMapTextCell techMapDropDown"
        defaultValue={props.equipmentRow.deviceId}
        onChange={e => props.changeDevice(e.target.value)}
      >
        {props.devices.map((inv, i) => (
          <option value={inv.id} key={i}>
            {inv.name}
          </option>
        ))}
      </select>

      {props.units.map((u, i) => (
        <TechMapCell
          row={props.row}
          column={i + 3}
          inputType="number"
          initialValue={"" + props.equipmentRow.countByUnits.get(u)}
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
