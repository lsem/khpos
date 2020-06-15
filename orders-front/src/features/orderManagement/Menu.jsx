import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  FormControlLabel,
  Checkbox,
  Divider,
  Menu,
  MenuItem,
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
  order,
  showZeros,
  setShowZeros,
  categoriesMenu,
  anchorItemsMenu,
  handelCategoryCheck,
  handleItemsMenuClose,
  handleChangeOrderStatus,
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
      <MenuItem disabled>Змінити статус:</MenuItem>

      {order &&
        order.avaliableActions.map((a, i) => (
          <MenuItem
            key={i}
            onClick={() => {
              handleChangeOrderStatus(a.id);
            }}
          >
            {a.name}
          </MenuItem>
        ))}

      <Divider />

      <FormControlLabel
        control={
          <Checkbox
            checked={showZeros}
            onChange={(e) => {
              setShowZeros(e.target.checked);
            }}
            color="primary"
          />
        }
        label="Показати '0'"
      />

      <Divider />

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
