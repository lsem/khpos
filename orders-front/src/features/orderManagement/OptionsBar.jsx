import React from "react";
import moment from "moment";
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
  }
}));

function OptionsBar({
  orderDate,
  pos,
  handleDateChange,
  handlePosChange
}) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <KhDatePicker
        value={moment(orderDate).valueOf()}
        onChange={handleDateChange}
        style={{ margin: 5 }}
      />

      <PosSelect style={{ margin: 5 }} onChange={handlePosChange} value={pos} />
    </div>
  );
}

export default OptionsBar;
