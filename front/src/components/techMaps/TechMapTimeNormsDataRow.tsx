import Icon from '../Icon';
import React from 'react';
import { ICONS } from '../../constants/icons';
import { TechMapCell } from './TechMapCell';

type Props = {
  units: number[];
  timeNorms: Map<number, number>;
  row: number;
  removeClick: () => void;
  updateCell: (unit: number, value: number) => void;
};

export const TechMapTimeNormsDataRow: React.FC<Props> = props => {
  return (
    <div className="gridRowWrapper">
      <div
        className="techMapTextCell"
        style={{ gridColumn: 2, gridRow: props.row }}
      />

      {props.units.map((u, i) => (
        <TechMapCell
          row={props.row}
          column={i + 3}
          inputType="number"
          initialValue={"" + props.timeNorms.get(u)}
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
    </div>
  );
};
