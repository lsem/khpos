import * as React from 'react';
import Icon from "../Icon";
import { ICONS } from "../../constants/icons";
import "./TechMapAddRow.css"

export interface Props {
  row: number
  click: Function
}

export const TechMapAddRow: React.FC<Props> = (props) => {
  return (
    <div className="gridRowWrapper">
      <div className="techMapAddRow" style={{ gridRow: props.row, gridColumn: "2 / -2" }}>

        <button onClick={() => props.click()}>
          <Icon size={16} color="#007aff" icon={ICONS.ADD} />
          <span>&nbsp;</span>
          <span>Додати</span>
        </button>

      </div>
    </div>
  );
}
