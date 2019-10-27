import React from "react";
import Icon from "../Icon";

type Props = {
  name: string;
  description: string;
  icon: string;
  iconSize: number;
  row: number;
};

export const TechMapStepSectionHeader: React.FC<Props> = props => {
  const { name, description, icon, iconSize, row } = props;

  return (
    <React.Fragment>
      <div
        className="techMapStepSectionHeaderBg"
        style={{ gridColumn: "2 / -2", gridRow: row }}
      />
      <div
        className="techMapStepSectionHeader"
        style={{ gridColumn: "2", gridRow: row }}
      >
        <Icon size={iconSize} color="rgba(0,0,0,.5)" icon={icon} />
        {name}
      </div>
      <div
        className="techMapStepSectionDescription"
        style={{ gridColumn: "3 / -2", gridRow: row }}
      >
        {description}
      </div>
    </React.Fragment>
  );
};
