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
  FormControlLabel,
  Checkbox,
  Divider,
  Paper,
  Menu,
} from "@material-ui/core";
import { Check, MoreVert, ExpandLess, ExpandMore } from "@material-ui/icons";
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
  fabMenu: {
    position: "fixed",
    bottom: theme.spacing(12),
    left: theme.spacing(5),
  },
  optionsBar: {
    position: "relative",
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
  itemsTable: {
    WebkitTapHighlightColor: "transparent",
    display: "table",
    width: "100%",
    borderSpacing: 0,
    cursor: "pointer",
    tableLayout: "auto",
    "& th": {
      position: "sticky",
      top: 0,
      zIndex: 2,
      backgroundColor: theme.palette.background.paper,
      textAlign: "left",
    },
    "& th, td": {
      padding: theme.spacing(2),
      borderColor: theme.palette.divider,
      borderStyle: "solid",
      borderWidth: "0 0 1px 0",
    },
    "& tr": {
      transition: "background-color 100ms linear",
      "&:nth-child(even)": {
        backgroundColor: theme.palette.background.default,
      },
      "&:nth-child(odd)": {
        backgroundColor: theme.palette.background.paper,
      },
      "&:active": {
        transition: "background-color 0ms linear",
        backgroundColor: theme.palette.action.focus,
      },
    },
  },
  textAlignRight: {
    textAlign: "right !important",
  },
  itemsMenuContainer: {
    display: "flex",
    flexDirection: "column",
    margin: "0 10px",
    backgroundColor: theme.palette.background.paper,
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
  const [showQuantityDialog, setShowQuantityDialog] = React.useState(false);
  const [currentItemQuantity, setCurrentItemQuantity] = React.useState(0);
  const [currentItemId, setCurrentItemId] = React.useState(null);
  const [categoriesMenu, setCategoriesMenu] = React.useState({});
  const [items, setItems] = React.useState([]);
  const [itemsView, setItemsView] = React.useState([]);
  const [anchorMenu, setAnchorMenu] = React.useState(null);
  const [showZeros, setShowZeros] = React.useState(true);
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
      setItems(JSON.parse(JSON.stringify(order.items)));
      setShowZeros(order.status === "new");
    }
  }, [order]);

  React.useEffect(() => {
    setItemsView(
      items.filter(
        (i) =>
          categoriesMenu[i.category] &&
          (showZeros || i.orderedcount + i.deliveredcount)
      )
    );
  }, [items, categoriesMenu, showZeros]);

  React.useEffect(() => {
    setCategoriesMenu((categoriesMenu) => {
      let object = {};
      Object.assign(
        object,
        ..._(items)
          .uniqBy((g) => g.category)
          .map((o) => {
            return categoriesMenu.hasOwnProperty(o.category)
              ? { [o.category]: categoriesMenu[o.category] }
              : { [o.category]: true };
          })
          .valueOf()
      );
      return object;
    });
  }, [items, showZeros]);
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

  const handleMenuButtonClick = (event) => {
    setAnchorMenu(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorMenu(null);
  };

  const handleFoldAll = () => {
    setCategoriesMenu(
      categoriesMenu.map((c) => ({
        ...c,
        expanded: false,
      }))
    );
  };

  const handleUnfoldAll = () => {
    setCategoriesMenu(
      categoriesMenu.map((c) => ({
        ...c,
        expanded: true,
      }))
    );
  };

  const handleHideUnordered = () => {
    setShowZeros(false);
  };

  const handleShowUnordered = () => {
    setShowZeros(true);
  };

  const handelCategoryCheck = (category, value) => {
    setCategoriesMenu({
      ...categoriesMenu,
      [category]: value,
    });
  };

  const handleItemClick = (itemId) => {
    setCurrentItemQuantity(
      items.find((i) => i.id === itemId)[
        order.status === "new" ? "orderedcount" : "deliveredcount"
      ]
    );
    setCurrentItemId(itemId);
    setShowQuantityDialog(true);
  };

  const handleQuantityDialogClose = () => {
    setItems(
      items.map((i) =>
        i.id === currentItemId
          ? {
              ...i,
              ["new" ? "orderedcount" : "deliveredcount"]: currentItemQuantity,
            }
          : i
      )
    );
    setCurrentItemId(null);
    setShowQuantityDialog(false);
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
          <Paper className={classes.list}>
            <table
              className={classNames(classes.itemsTable, classes.unselectable)}
            >
              <tbody>
                <tr>
                  <th>Товар</th>
                  <th className={classes.textAlignRight}>Замовлено</th>
                  {order.status === "new" ? null : (
                    <th className={classes.textAlignRight}>Прийнято</th>
                  )}
                </tr>
                {itemsView.map((item, i) => (
                  <tr
                    key={i}
                    onClick={() => {
                      handleItemClick(item.id);
                    }}
                  >
                    <td>{item.name}</td>
                    <td className={classes.textAlignRight}>
                      {item.orderedcount}
                    </td>
                    {order.status === "new" ? null : (
                      <td className={classes.textAlignRight}>
                        {item.deliveredcount}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </Paper>
        )}

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
      </div>

      {!Object.keys(categoriesMenu).length ? null : (
        <Fab
          color="default"
          className={classes.fabMenu}
          onClick={handleMenuButtonClick}
          size="small"
        >
          <MoreVert />
        </Fab>
      )}
      <Fab color="primary" className={classes.fab}>
        <Check />
      </Fab>

      <Menu
        id="simple-menu"
        anchorEl={anchorMenu}
        keepMounted
        open={Boolean(anchorMenu)}
        onClose={handleMenuClose}
      >
        <div className={classes.itemsMenuContainer}>
          <FormControlLabel
            control={
              <Checkbox
                checked={showZeros}
                onChange={(e) => {
                  setShowZeros(e.target.checked);
                }}
                name="checkedB"
                color="primary"
              />
            }
            label="Показати '0'"
          />

          <Divider />

          {Object.keys(categoriesMenu).map((k) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={categoriesMenu[k]}
                  onChange={(e) => {
                    handelCategoryCheck(k, e.target.checked);
                  }}
                  name="checkedB"
                  color="primary"
                />
              }
              label={k}
            />
          ))}
        </div>
      </Menu>

      <Dialog
        open={showQuantityDialog}
        onClose={() => {
          handleQuantityDialogClose();
        }}
        aria-labelledby="order-quantity-dialog"
      >
        <DialogContent>
          <DialogTitle id="order-quantity-dialog">
            {order && order.status === "new" ? "Замовити" : "Прийняти"}{" "}
            {() => {
              const item = items.find((i) => i.id === currentItemId);
              return item ? item.name : null
            }}
          </DialogTitle>
          <TextField
            type="number"
            variant="outlined"
            value={currentItemQuantity}
            onChange={(e) => {
              setCurrentItemQuantity(+e.target.value);
            }}
            autoFocus
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              handleQuantityDialogClose();
            }}
            color="primary"
            //autoFocus
          >
            Так
          </Button>
        </DialogActions>
      </Dialog>

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
