import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  FormControlLabel,
  Checkbox,
  Menu,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    "& label": {
      userSelect: "none",
      display: "block",
      margin: "0 15px 0 5px",
      transition: "background-color 100ms linear",
    },
    "& label:active": {
      transition: "background-color 0ms linear",
      backgroundColor: theme.palette.action.focus,
    },
  },
}));

export default function OrderMenu({
  categoriesMenu,
  anchorItemsMenu,
  handelCategoryCheck,
  handleItemsMenuClose,
}) {
  const classes = useStyles();

  return (
    <Menu
      className={classes.root}
      anchorEl={anchorItemsMenu}
      keepMounted
      open={Boolean(anchorItemsMenu)}
      onClose={handleItemsMenuClose}
      disableAutoFocusItem
      variant="menu"
    >
      {Object.keys(categoriesMenu).map((k, i) => (
        <FormControlLabel
          key={i}
          control={
            <Checkbox
              checked={categoriesMenu[k]}
              onChange={(e) => {
                handelCategoryCheck(k, e.target.checked);
              }}
              color="primary"
            />
          }
          label={k}
        />
      ))}
    </Menu>
  );
}
