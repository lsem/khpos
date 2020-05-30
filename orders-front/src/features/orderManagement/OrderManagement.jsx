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
  Box,
} from "@material-ui/core";
import { Check, MoreVert, ArrowDropDown } from "@material-ui/icons";
import moment from "moment";
import _ from "lodash";
import classNames from "classnames";
import {
  thunkGetOrderFromApi,
  thunkGetSellPointsFromApi,
} from "./orderManagementSlice";
import PrintView from "./PrintView";
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
  actionHint: {
    textAlign: "center",
    margin: theme.spacing(6),
    color: theme.palette.text.hint,
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
      textAlign: "left",
      borderColor: theme.palette.divider,
      borderStyle: "solid",
      borderWidth: "0 0 1px 0",
      transition: "background-color 200ms linear",
      backgroundColor: theme.palette.background.paper,
    },
    "& th:active": {
      transition: "background-color 0ms linear",
      backgroundColor: theme.palette.secondary.light,
    },
    "& td": {
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
  sortIconInvisible: {
    transition: "transform 0ms linear",
    transform: "rotate(-90deg)",
    opacity: 0,
  },
  sortIconAsc: {
    opacity: 1,
    transition: "transform 100ms linear",
    transform: "rotate(0deg)",
  },
  sortIconDsc: {
    opacity: 1,
    transition: "transform 100ms linear",
    transform: "rotate(-180deg)",
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
  const [selectedItem, setSelectedItem] = React.useState(null);
  const [categoriesMenu, setCategoriesMenu] = React.useState({});
  const [items, setItems] = React.useState([]);
  const [itemsView, setItemsView] = React.useState([]);
  const [anchorMenu, setAnchorMenu] = React.useState(null);
  const [showZeros, setShowZeros] = React.useState(true);
  const [tableSorting, setTableSorting] = React.useState(null);
  const [showOrderSummary, setShowOrderSummary] = React.useState(false);
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
      setTableSorting(null);
    }
  }, [order]);

  React.useEffect(() => {
    const itemsViewFromItems = items.filter(
      (i) =>
        categoriesMenu[i.category] &&
        (showZeros || i.orderedcount + i.deliveredcount)
    );
    if (tableSorting && tableSorting.order === "ASC") {
      itemsViewFromItems.sort((a, b) => {
        if (a[tableSorting.column] > b[tableSorting.column]) {
          return 1;
        } else if (a[tableSorting.column] < b[tableSorting.column]) {
          return -1;
        } else {
          return 0;
        }
      });
    }
    if (tableSorting && tableSorting.order === "DSC") {
      itemsViewFromItems.sort((a, b) => {
        if (a[tableSorting.column] < b[tableSorting.column]) {
          return 1;
        } else if (a[tableSorting.column] > b[tableSorting.column]) {
          return -1;
        } else {
          return 0;
        }
      });
    }
    setItemsView(itemsViewFromItems);
  }, [items, categoriesMenu, showZeros, tableSorting]);

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

  const handleMenuButtonClick = (event) => {
    setAnchorMenu(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorMenu(null);
  };

  const handelCategoryCheck = (category, value) => {
    setCategoriesMenu({
      ...categoriesMenu,
      [category]: value,
    });
  };

  const handleItemClick = (item) => {
    if (["new", "processing"].includes(order.status)) {
      setSelectedItem({ ...item });
      setShowQuantityDialog(true);
    }
  };

  const handleQuantityDialogClose = (confirmed) => {
    if (confirmed) {
      setItems(
        items.map((i) => (i.id === selectedItem.id ? { ...selectedItem } : i))
      );
    }
    setSelectedItem(null);
    setShowQuantityDialog(false);
  };

  const handleTableSort = (column) => {
    if (!tableSorting) {
      setTableSorting({ column, order: "ASC" });
    } else if (tableSorting.column === column) {
      let sorting = null;
      if (tableSorting.order === "ASC") {
        sorting = { ...tableSorting, order: "DSC" };
      }
      setTableSorting(sorting);
    } else {
      setTableSorting({
        column,
        order: "ASC",
      });
    }
  };

  const handleShowSummaryClick = () => {
    if (order && items.filter((i) => i.orderedcount > 0).length) {
      setShowOrderSummary(true);
    } else {
      setMessageBox("Ви нічого не замовили");
    }
  };
  //#endregion

  //#region JSX
  const generateTableHeader = (columnName, justifyContent, content) => {
    return (
      <Box
        display="flex"
        alignItems="center"
        onClick={() => {
          handleTableSort(columnName);
        }}
        bgcolor="transparent"
        padding={2}
        justifyContent={justifyContent}
      >
        {content}
        <ArrowDropDown
          className={classNames({
            [classes.sortIconInvisible]: true,
            [classes.sortIconAsc]:
              tableSorting &&
              tableSorting.column === columnName &&
              tableSorting.order === "ASC",
            [classes.sortIconDsc]:
              tableSorting &&
              tableSorting.column === columnName &&
              tableSorting.order === "DSC",
          })}
        />
      </Box>
    );
  };

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
                  <th>{generateTableHeader("name", "flex-start", "Товари")}</th>
                  <th>
                    {generateTableHeader(
                      "orderedcount",
                      "flex-end",
                      "Замовлено"
                    )}
                  </th>
                  {order.status === "new" ? null : (
                    <th>
                      {generateTableHeader(
                        "deliveredcount",
                        "flex-end",
                        "Прийнято"
                      )}
                    </th>
                  )}
                </tr>

                {itemsView.map((item, i) => (
                  <tr
                    key={i}
                    onClick={() => {
                      handleItemClick(item);
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
      <Fab
        color="primary"
        className={classes.fab}
        onClick={handleShowSummaryClick}
      >
        <Check />
      </Fab>

      <Menu
        className={classes.itemsMenuContainer}
        anchorEl={anchorMenu}
        keepMounted
        open={Boolean(anchorMenu)}
        onClose={handleMenuClose}
        disableAutoFocusItem
        variant="menu"
      >
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

      <Dialog
        open={showQuantityDialog}
        onClose={() => {
          handleQuantityDialogClose(false);
        }}
        aria-labelledby="order-quantity-dialog"
      >
        {order && selectedItem ? (
          <React.Fragment>
            <DialogTitle id="order-quantity-dialog">
              {order.status === "new" ? "Замовити" : "Прийняти"}{" "}
              {selectedItem.name}
            </DialogTitle>
            <DialogContent>
              <Box display="flex" justifyContent="center">
                <TextField
                  type="number"
                  variant="outlined"
                  value={
                    order.status === "new"
                      ? selectedItem.orderedcount
                      : selectedItem.deliveredcount
                  }
                  inputProps={{ min: 0 }}
                  onChange={(e) => {
                    setSelectedItem({
                      ...selectedItem,
                      [order.status === "new"
                        ? "orderedcount"
                        : "deliveredcount"]: +e.target.value,
                    });
                  }}
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleQuantityDialogClose(true);
                    }
                  }}
                  onFocus={(e) => {
                    e.target.select();
                  }}
                />
              </Box>
            </DialogContent>
          </React.Fragment>
        ) : null}

        <DialogActions>
          <Button
            onClick={() => {
              handleQuantityDialogClose(false);
            }}
            color="secondary"
          >
            Ні
          </Button>
          <Button
            onClick={() => {
              handleQuantityDialogClose(true);
            }}
            color="primary"
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

      {order ? (
        <Dialog
          fullScreen
          open={showOrderSummary}
          onClose={() => {
            setShowOrderSummary(false);
          }}
        >
          <PrintView
            items={items}
            orderStatus={order.status}
            orderDate={moment(orderDate).format("DD.MM.YYYY")}
            sellPoint={sellPoints.find((sp) => sp.id === sellPointId).name}
          />

          {order.status === "closed" ? null : (
            <Box
              display="flex"
              justifyContent="center"
              displayPrint="none"
              margin="0 0 30px 0"
            >
              <Button
                onClick={() => {
                  setShowOrderSummary(false);
                }}
                color="secondary"
              >
                Назад
              </Button>
              <Button onClick={() => {}} color="primary">
                Зберегти
              </Button>
            </Box>
          )}
        </Dialog>
      ) : null}
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
