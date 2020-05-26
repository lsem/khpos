//#region IMPORTS
import React from "react";
import { connect } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import {
  TextField,
  Fab,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
  Divider,
} from "@material-ui/core";
import { AssignmentTurnedIn, ExpandLess, ExpandMore } from "@material-ui/icons";
import moment from "moment";
import _ from "lodash";
import classNames from "classnames";
import {
  thunkGetOrderFromApi,
  thunkGetSellPointsFromApi,
} from "./orderManagementSlice";
//#endregion

//#region STYLES

const useStyles = makeStyles((theme) => ({
  root: {},
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
  optionsBar: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    margin: "20px 0 5px 0",
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 140,
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
    flexWrap: "wrap",
    alignItems: "center",
    alignContent: "center",
    transition: "background-color 200ms linear",
    cursor: "pointer",
  },
  goodsLi: {
    padding: "5px 10px",
    "&:nth-child(even)": {
      backgroundColor: theme.palette.background.default,
    },
    "&:nth-child(odd)": {
      backgroundColor: theme.palette.background.paper,
    },
    "&:hover": {
      backgroundColor: theme.palette.action.focus,
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
  actionHint: {
    textAlign: "center",
    margin: theme.spacing(6),
    color: theme.palette.text.hint,
  },
  listCellHint: {
    color: theme.palette.text.hint,
    margin: theme.spacing(2),
  },
  flexLeft: {
    marginRight: "auto",
  },
  flexRight: {
    marginLeft: "auto",
  },
}));

//#endregion

function MakeOrder({ getOrder, getSellPoints, sellPoints, order }) {
  const classes = useStyles();

  //#region STATE
  const [orderDate, setOrderDate] = React.useState(
    moment().add(1, "days").valueOf()
  );
  const [sellPointId, setSellPointId] = React.useState("");
  const [messageBox, setMessageBox] = React.useState(false);
  const [categoriesMenu, setCategoriesMenu] = React.useState([]);
  const [items, setItems] = React.useState([]);
  //#endregion

  //#region EFFECTS
  React.useEffect(() => {
    getSellPoints();
  }, [getSellPoints]);

  React.useEffect(() => {
    if (sellPointId) getOrder(orderDate, sellPointId);
  }, [orderDate, sellPointId, getOrder]);

  React.useEffect(() => {
    if (order) {
      setCategoriesMenu(
        _(order.items)
          .uniqBy((g) => {
            return g.category;
          })
          .map((o) => {
            return { category: o.category, expanded: false };
          })
          .valueOf()
      );

      setItems(JSON.parse(JSON.stringify(order.items)));
    }
  }, [order]);
  //#endregion

  //#region UI HANDLERS
  const handleExpandClick = (category) => {
    setCategoriesMenu(
      categoriesMenu.map((c) =>
        c.category !== category.category
          ? c
          : {
              ...category,
              expanded: !category.expanded,
            }
      )
    );
  };

  const handleOrderedQuantityChange = (event, goodId) => {
    setItems(
      items.map((g) =>
        g.id !== goodId ? g : { ...g, orderedcount: +event.target.value }
      )
    );
  };

  const handleDeliveredQuantityChange = (event, goodId) => {
    setItems(
      items.map((g) =>
        g.id !== goodId ? g : { ...g, deliveredcount: +event.target.value }
      )
    );
  };
  //#endregion

  //#region JSX
  return (
    <React.Fragment>
      <div className={classes.root}>
        <div className={classes.optionsBar}>
          <FormControl className={classes.formControl}>
            <TextField
              id="date"
              label="Дата замовлення"
              type="date"
              defaultValue={moment(orderDate).format("YYYY-MM-DD")}
              InputLabelProps={{
                shrink: true,
              }}
              onChange={(e) => {
                setOrderDate(e.target.value);
              }}
            />
          </FormControl>
          {sellPoints ? (
            <FormControl className={classes.formControl}>
              <InputLabel id="select-sell-point-label">
                Точка продажу
              </InputLabel>
              <Select
                labelId="select-sell-point-label"
                id="select-sell-point"
                value={sellPointId}
                onChange={(e) => {
                  setSellPointId(e.target.value);
                }}
              >
                {sellPoints.map((sp) => (
                  <MenuItem key={sp.id} value={sp.id}>
                    {sp.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Typography>завантажується...</Typography>
          )}
        </div>

        {!order ? null : (
          <div className={classes.list}>
            {categoriesMenu.map((c, i) => {
              const categotyItems = items.filter(
                (i) => i.category === c.category
              );
              const categorySummary = categotyItems.reduce(
                (acc, cur) => acc + cur.orderedcount,
                0
              );
              return (
                <React.Fragment key={i}>
                  <div
                    className={classNames(classes.li, classes.categoryLi)}
                    onClick={() => handleExpandClick(c)}
                  >
                    <Typography className={classes.flexLeft}>
                      {c.category}{" "}
                      {categorySummary ? `(${categorySummary})` : null}
                    </Typography>
                    <div className={classes.flexRight}>
                      {c.expanded ? <ExpandLess /> : <ExpandMore />}
                    </div>
                  </div>
                  <div
                    className={classNames(
                      classes.expandable,
                      c.expanded
                        ? classes.expandableVisible
                        : classes.expandableHidden
                    )}
                  >
                    {_(categotyItems)
                      .sortBy("name")
                      .map((i) => {
                        return (
                          <div
                            className={classNames(classes.li, classes.goodsLi)}
                            key={i.id}
                            onClick={(e) => {
                              const ordInput = document.getElementById(
                                `ord-input-${i.id}`
                              );
                              const delInput = document.getElementById(
                                `del-input-${i.id}`
                              );
                              if (ordInput) ordInput.focus();
                              if (delInput) delInput.focus();
                            }}
                          >
                            <span
                              style={{ marginRight: "auto", maxWidth: 200 }}
                              className={classes.unselectable}
                            >
                              {i.name}
                            </span>
                            <div style={{ marginLeft: "auto" }}>
                              {order.status !== "closed" &&
                              order.status !== "processing" ? (
                                <input
                                  id={`ord-input-${i.id}`}
                                  className={classes.numberInput}
                                  value={i.orderedcount}
                                  type="number"
                                  onFocus={(event) => {
                                    event.target.select();
                                  }}
                                  onChange={(e) => {
                                    handleOrderedQuantityChange(e, i.id);
                                  }}
                                />
                              ) : (
                                <span className={classes.listCellHint}>
                                  замовлено: {i.orderedcount}
                                </span>
                              )}
                              {order.status === "processing" ? (
                                <input
                                  id={`del-input-${i.id}`}
                                  className={classes.numberInput}
                                  value={i.deliveredcount}
                                  type="number"
                                  onFocus={(event) => {
                                    event.target.select();
                                  }}
                                  onChange={(e) => {
                                    handleDeliveredQuantityChange(e, i.id);
                                  }}
                                />
                              ) : null}
                              {order.status === "closed" ? (
                                <span className={classes.listCellHint}>
                                  прийнято: {i.deliveredcount}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        );
                      })
                      .valueOf()}
                    <Divider />
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {sellPointId ? null : (
        <Typography variant="h5" className={classes.actionHint}>
          оберіть точку продажу
        </Typography>
      )}

      {!(sellPointId && !order) ? null : (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress style={{ margin: "30px auto" }} />
        </div>
      )}

      <Fab color="primary" className={classes.fab}>
        <AssignmentTurnedIn />
      </Fab>

      <Dialog
        open={messageBox}
        onClose={() => setMessageBox(false)}
        aria-labelledby="alert-dialog-title"
      >
        <DialogContent>
          <DialogTitle id="alert-dialog-title">{messageBox}</DialogTitle>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setMessageBox(false)}
            color="primary"
            autoFocus
          >
            Зрозуміло
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
  //#endregion
}

const mapStateToProps = (state) => ({
  order: state.orderManagement.order,
  sellPoints: state.orderManagement.sellPoints,
  error: state.orderManagement.errorMessage,
});

const mapDispatchToProps = (dispatch) => ({
  getOrder: (date, sellPointId) => {
    dispatch(thunkGetOrderFromApi(date, sellPointId));
  },
  getSellPoints: () => {
    dispatch(thunkGetSellPointsFromApi());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(MakeOrder);
