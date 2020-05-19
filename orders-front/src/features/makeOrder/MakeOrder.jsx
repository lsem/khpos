import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { TextField, Fab, Typography } from "@material-ui/core";
import { AssignmentTurnedIn, ExpandLess, ExpandMore } from "@material-ui/icons";
import moment from "moment";
import _ from "lodash";
import classNames from "classnames";
import goods from "../../samples/goods.json";

const useStyles = makeStyles((theme) => ({
  unselectable: {
    userSelect: "none",
  },
  list: {
    maxWidth: 800,
    margin: "0 auto",
  },
  fab: {
    position: "fixed",
    bottom: theme.spacing(4),
    left: theme.spacing(4),
  },
  dateField: {
    display: "block",
    maxWidth: 150,
    margin: "20px auto 5px auto",
  },
  expandable: {},
  expandableHidden: {
    display: "none",
  },
  expandableVisible: {
    display: "block",
  },
  li: {
    margin: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    transition: "background-color 200ms linear",
    cursor: "pointer",
  },
  goodsLi: {
    padding: "0 10px",
    "&:hover": {
      backgroundColor: theme.palette.action.focus,
    },
    "&:active": {
      backgroundColor: theme.palette.action.active,
    },
    "&:nth-child(even)": {
      backgroundColor: theme.palette.background.default,
    },
    "&:nth-child(odd)": {
      backgroundColor: theme.palette.background.paper,
    },
  },
  categoryLi: {
    padding: theme.spacing(2),
    borderWidth: "0 0 1px 0",
    borderStyle: "solid",
    borderColor: theme.palette.divider,
    "&:hover": {
      backgroundColor: theme.palette.action.focus,
    },
    "&:active": {
      backgroundColor: theme.palette.action.active,
    },
  },
  numberInput: {
    height: 36,
    width: 80,
    padding: theme.spacing(1),
    margin: 0,
    boxSizing: "border-box",
    outline: "none",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.palette.text.disabled,
    borderRadius: 5,
    borderStyle: "solid",
    color: theme.palette.text.primary,
    fontFamily: "inherit",
    fontSize: "inherit",
    "&:hover": {
      borderColor: theme.palette.text.primary,
    },
    "&:focus": {
      borderWidth: 2,
      borderRadius: 5,
      borderColor: theme.palette.info.dark,
    },
  },
}));

function MakeOrder() {
  const classes = useStyles();

  const [state, setState] = useState({
    categories: _(goods)
      .uniqBy((g) => g.category)
      .map((o) => {
        return { category: o.category, expanded: false };
      })
      .valueOf(),

    goodsWithQty: goods.map((g) => {
      return { ...g, quantity: 0 };
    }),
  });

  const handleExpandClick = (category) => {
    setState({
      ...state,
      categories: state.categories.map((c) =>
        c.category !== category.category
          ? c
          : {
              ...category,
              expanded: !category.expanded,
            }
      ),
    });
  };

  return (
    <React.Fragment>
      <div>
        <TextField
          id="date"
          label="Дата замовлення"
          type="date"
          defaultValue={moment().add(1, "days").format("YYYY-MM-DD")}
          className={classes.dateField}
          InputLabelProps={{
            shrink: true,
          }}
        />
        {
          <div className={classes.list}>
            {state.categories.map((c, i) => (
              <React.Fragment key={i}>
                <div
                  className={classNames(classes.li, classes.categoryLi)}
                  onClick={() => handleExpandClick(c)}
                >
                  <Typography>{c.category}</Typography>
                  {c.expanded ? <ExpandLess /> : <ExpandMore />}
                </div>
                <div
                  className={classNames(
                    classes.expandable,
                    c.expanded
                      ? classes.expandableVisible
                      : classes.expandableHidden
                  )}
                >
                  {_(state.goodsWithQty)
                    .filter((g) => g.category !== c.category)
                    .sortBy("name")
                    .map((g, i) => {
                      return (
                        <div
                          className={classNames(classes.li, classes.goodsLi)}
                          key={i}
                          onClick={(e) => {
                            e.target.childNodes[1] &&
                              e.target.childNodes[1].focus();
                          }}
                        >
                          <p className={classes.unselectable}>{g.name}</p>
                          <input
                            className={classes.numberInput}
                            defaultValue={g.quantity}
                            type="number"
                            onFocus={(event) => {
                              event.target.select();
                            }}
                          />
                        </div>
                      );
                    })
                    .valueOf()}
                </div>
              </React.Fragment>
            ))}
          </div>
        }
      </div>

      <Fab color="primary" className={classes.fab}>
        <AssignmentTurnedIn />
      </Fab>
    </React.Fragment>
  );
}

export default MakeOrder;
