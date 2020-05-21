import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  TextField,
  Fab,
  Typography,
  Dialog,
  Slide,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@material-ui/core";
import { AssignmentTurnedIn, ExpandLess, ExpandMore } from "@material-ui/icons";
import moment from "moment";
import _ from "lodash";
import classNames from "classnames";
import goods from "../../samples/goods.json";
import sellPoints from "../../samples/sellPoints.json";
import OrderCheckout from "./OrderCheckout";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

//#region STYLES

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
    alignItems: "center",
    justifyContent: "space-between",
    transition: "background-color 200ms linear",
    cursor: "pointer",
  },
  goodsLi: {
    padding: "0 10px",
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
}));

//#endregion

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

    orderedGoods: [],

    showCheckout: false,

    messageBox: {
      show: false,
      message: "",
    },

    orderDate: moment().add(1, "days").valueOf(),

    sellPointId: sellPoints[0].id,
  });

  const handleOrderDateChange = (event) => {
    setState({
      ...state,
      orderDate: moment(event.target.value).valueOf(),
    });
  };

  const handleSellPointChange = (event) => {
    setState({
      ...state,
      sellPointId: event.target.value,
    });
  };

  const showMessageBox = (message) => {
    setState({
      ...state,
      messageBox: {
        show: true,
        message,
      },
    });
  };

  const closeMessageBox = () => {
    setState({
      ...state,
      messageBox: {
        show: false,
        message: "",
      },
    });
  };

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

  const handleQuantityChange = (event, goodId) => {
    setState({
      ...state,
      goodsWithQty: state.goodsWithQty.map((g) =>
        g.id !== goodId ? g : { ...g, quantity: +event.target.value }
      ),
    });
  };

  const handleCheckoutClick = () => {
    const atLeastOneOrdered = state.goodsWithQty.filter((g) => g.quantity > 0);

    if (!atLeastOneOrdered || !atLeastOneOrdered.length) {
      showMessageBox("Ви нічого не замовили.");
      return;
    }

    const orderedGoods = _.groupBy(atLeastOneOrdered, "category");

    setState({
      ...state,
      orderedGoods,
      showCheckout: true,
    });
  };

  const handleCancelCheckoutClick = () => {
    setState({
      ...state,
      showCheckout: false,
    });
  };

  return (
    <React.Fragment>
      <div>
        <div className={classes.optionsBar}>
          <FormControl className={classes.formControl}>
            <TextField
              id="date"
              label="Дата замовлення"
              type="date"
              defaultValue={moment(state.orderDate).format("YYYY-MM-DD")}
              InputLabelProps={{
                shrink: true,
              }}
              onChange={handleOrderDateChange}
            />
          </FormControl>
          <FormControl className={classes.formControl}>
            <InputLabel id="select-sell-point-label">Точка продажу</InputLabel>
            <Select
              labelId="select-sell-point-label"
              id="select-sell-point"
              value={state.sellPointId}
              onChange={handleSellPointChange}
            >
              {sellPoints.map((sp) => (
                <MenuItem key={sp.id} value={sp.id}>
                  {sp.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
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
                    .filter((g) => g.category === c.category)
                    .sortBy("name")
                    .map((g) => {
                      return (
                        <div
                          className={classNames(classes.li, classes.goodsLi)}
                          key={g.id}
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
                            onChange={(e) => handleQuantityChange(e, g.id)}
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

      <Fab
        color="primary"
        className={classes.fab}
        onClick={handleCheckoutClick}
      >
        <AssignmentTurnedIn />
      </Fab>

      <Dialog
        fullScreen
        open={state.showCheckout}
        onClose={handleCancelCheckoutClick}
        TransitionComponent={Transition}
      >
        <OrderCheckout
          orderDate={moment(state.orderDate).format("DD.MM.YYYY")}
          sellPoint={sellPoints.find((sp) => sp.id === state.sellPointId).name}
          orderedGoods={state.orderedGoods}
          closeCheckout={handleCancelCheckoutClick}
        />
      </Dialog>

      <Dialog
        open={state.messageBox.show}
        onClose={closeMessageBox}
        aria-labelledby="alert-dialog-title"
      >
        <DialogContent>
          <DialogTitle id="alert-dialog-title">
            {state.messageBox.message}
          </DialogTitle>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeMessageBox} color="primary" autoFocus>
            Зрозуміло
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default MakeOrder;
