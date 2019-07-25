import React from "react";
import Icon from "../Icon";
import { ICONS } from "../../constants/icons";

interface Props {
  startRow: number;
  addStep: Function;
}

export const TechMapStepSeparator: React.FC<Props> = props => {
  return (
    <div
      className="techMapStepSeparator"
      style={{ gridColumn: "2 / -2", gridRow: props.startRow }}
    >
      <hr />
      <button className="techMapRoundButton1" onClick={() => props.addStep()}>
        <Icon size={16} color="#007aff" icon={ICONS.ADD} />
      </button>
      <hr />
    </div>
  );
};
