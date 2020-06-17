import React from "react";
import { makeStyles } from "@material-ui/core/styles";

import KhDatePicker from "../datePicker/KhDatePicker";
import PosSelect from "../pos/PosSelect";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    margin: `${theme.spacing(2)}px 0`,
  },
}));

function OptionsBar({ orderDate, pos, onDateChange, onPosChange }) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <KhDatePicker value={orderDate} onChange={onDateChange} />
      <PosSelect
        style={{ margin: 5 }}
        onChange={onPosChange}
        value={pos}
        addAll
        allSelectedByDefault
      />
    </div>
  );
}

export default OptionsBar;
