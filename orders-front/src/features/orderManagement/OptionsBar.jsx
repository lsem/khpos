import React from "react";
import moment from "moment";
import { makeStyles } from "@material-ui/core/styles";

import KhDatePicker from "../datePicker/KhDatePicker";
import PosSelect from "../pos/PosSelect";
import userRoles from "../../constants/userRoles";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing(2),
  },
}));

function OptionsBar({
  orderDate,
  posId,
  handleDateChange,
  handlePosChange,
  userRole,
}) {
  const classes = useStyles();

  const canAccessAllPos = (role) => {
    return [userRoles.admin, userRoles.prodStaff].includes(role);
  };

  return (
    <div className={classes.root}>
      <KhDatePicker
        value={moment(orderDate).valueOf()}
        onChange={handleDateChange}
        style={{ margin: 5 }}
      />

      <PosSelect
        style={{ margin: 5 }}
        onChange={handlePosChange}
        value={posId}
        addAll={canAccessAllPos(userRole)}
      />
    </div>
  );
}

export default OptionsBar;
