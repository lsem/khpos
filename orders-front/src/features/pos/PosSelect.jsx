import React from "react";
import { connect } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { Menu, MenuItem, Button } from "@material-ui/core";
import { ArrowDropDown } from "@material-ui/icons";

import { thunkGetPosFromApi } from "./posSlice";

export const AllPosId = "-ALLPOS-";

const useStyles = makeStyles((theme) => ({
  root: {},
}));

function PosSelect({
  posItems,
  getPosFromApi,
  onChange,
  variant,
  size,
  addAll,
  allSelectedByDefault,
  style,
  value,
}) {
  const classes = useStyles();
  const [itemsView, setItemsView] = React.useState(null);
  const [anchorPosMenu, setAnchorPosMenu] = React.useState(null);

  React.useEffect(() => {
    getPosFromApi();
  }, [getPosFromApi]);

  React.useEffect(() => {
    if (!posItems) return;
    if (addAll) {
      const allPos = { posID: AllPosId, posIDName: "ВСІ" };
      setItemsView([allPos, ...posItems]);
      if (allSelectedByDefault) {
        onChange && onChange(allPos);
      }
    } else {
      setItemsView([...posItems]);
    }
  }, [posItems, addAll, allSelectedByDefault, onChange]);

  React.useEffect(() => {
    setAnchorPosMenu(null);
  }, [value]);

  return (
    <div className={classes.root} style={style}>
      <Button
        variant={variant ? variant : "outlined"}
        size={size ? size : "large"}
        color="primary"
        onClick={(e) => {
          setAnchorPosMenu(e.currentTarget);
        }}
      >
        {value ? value.posIDName : "Точка продажу.."}
        <ArrowDropDown style={{ margin: "0 -10px 0 10px" }} />
      </Button>
      <Menu
        anchorEl={anchorPosMenu}
        keepMounted
        open={Boolean(anchorPosMenu)}
        onClose={() => {
          setAnchorPosMenu(null);
        }}
        onBlur={() => {
          setAnchorPosMenu(null);
        }}
        disableAutoFocusItem
        variant="menu"
      >
        {itemsView
          ? itemsView.map((p, i) => (
              <MenuItem
                key={i}
                value={p.posID}
                onClick={() => {
                  onChange && onChange(p);
                }}
              >
                {p.posIDName}
              </MenuItem>
            ))
          : null}
      </Menu>
    </div>
  );
}

const mapStateToProps = (state) => ({
  posItems: state.pos.items,
  error: state.pos.errorMessage,
});

const mapDispatchToProps = (dispatch) => ({
  getPosFromApi: () => {
    dispatch(thunkGetPosFromApi());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(PosSelect);
