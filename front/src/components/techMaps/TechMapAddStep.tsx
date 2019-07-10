import React from "react";
import Icon from "../Icon";
import { ICONS } from "../../constants/icons";

interface Props {
  increaseRowCount: Function;
  addStep: () => void;
}

export const TechMapAddStep: React.FC<Props> = props => {
  return (
    <button
      className="techMapAddStepButton"
      style={{ gridColumn: "2 / -2", gridRow: props.increaseRowCount(1) }}
      onClick={() => props.addStep()}
    >
      <Icon size={16} color="#007aff" icon={ICONS.ADD} />
      <span>&nbsp;</span>
      <span>Додати крок</span>
    </button>
  );
};
