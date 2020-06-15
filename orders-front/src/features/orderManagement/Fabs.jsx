import React from "react";
import { Fab } from "@material-ui/core";
import { Check, MoreVert } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "fixed",
    bottom: theme.spacing(4),
    right: theme.spacing(4),
    "& > button": {
      margin: 5,
    },
  },
}));

export default function Fabs({
  categoriesMenu,
  userMadeChanges,
  handleItemsMenuButtonClick,
  handleShowSummaryClick,
}) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      {!Object.keys(categoriesMenu).length ? null : (
        <Fab color="default" onClick={handleItemsMenuButtonClick} size="small">
          <MoreVert />
        </Fab>
      )}
      {!userMadeChanges ? null : (
        <Fab color="primary" onClick={handleShowSummaryClick}>
          <Check />
        </Fab>
      )}
    </div>
  );
}
