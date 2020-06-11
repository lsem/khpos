//#region IMPORTS
import React from "react";
import { Prompt } from "react-router-dom";
import { connect } from "react-redux";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {
  TextField,
  Fab,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Divider,
  Paper,
  Menu,
  Box,
  Snackbar,
  SnackbarContent,
  MenuItem,
} from "@material-ui/core";
import { Check, MoreVert, ArrowDropDown } from "@material-ui/icons";
import moment from "moment";
import _ from "lodash";
import classNames from "classnames";
import {
  thunkApiGetDay,
  thunkApiPatchDay,
  thunkChangeDayStatus,
} from "./orderManagementSlice";
import PrintView from "./PrintView";
import KhDatePicker from "../datePicker/KhDatePicker";
import PosSelect from "../pos/PosSelect";
import orderStatuses from "../../constants/orderStatuses";
import { useMessageBox } from "../messageBox/MessageBoxService";
//#endregion

//#region STYLES

const useStyles = makeStyles((theme) => ({
  root: {
    margin: "0 16px",
    [theme.breakpoints.down("xs")]: {
      margin: 0,
    },
  },
  unselectable: {
    userSelect: "none",
  },
  list: {
    maxWidth: 800,
    margin: "0 auto",
  },
  optionsBar: {
    position: "relative",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    margin: "16px 0",
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
  cellHint: {
    color: theme.palette.text.hint,
    marginLeft: 10,
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
  fab: {
    margin: 5,
  },
}));

//#endregion

function OrderManagement({ getDay, saveDay, changeDayStatus, order, error }) {
  const classes = useStyles();
  const theme = useTheme();
  const messageBox = useMessageBox();

  //#region STATE
  const [orderDate, setOrderDate] = React.useState(
    moment().add(1, "days").valueOf()
  );
  const [pos, setPos] = React.useState(null);
  const [showQuantityDialog, setShowQuantityDialog] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState(null);
  const [categoriesMenu, setCategoriesMenu] = React.useState({});
  const [items, setItems] = React.useState([]);
  const [itemsView, setItemsView] = React.useState([]);
  const [anchorItemsMenu, setAnchorItemsMenu] = React.useState(null);
  const [showZeros, setShowZeros] = React.useState(true);
  const [tableSorting, setTableSorting] = React.useState(null);
  const [showOrderSummary, setShowOrderSummary] = React.useState(false);
  const [userMadeChanges, setUserMadeChanges] = React.useState(false);
  const [showErrorToast, setShowErrorToast] = React.useState(false);
  //#endregion

  //#region EFFECTS
  React.useEffect(() => {
    if (pos) getDay(moment(orderDate).valueOf(), pos.posID);
  }, [orderDate, pos, getDay]);

  React.useEffect(() => {
    if (order) {
      setItems(
        JSON.parse(JSON.stringify(order.items)).map((i) => ({
          ...i,
          oldCount: i.count,
        }))
      );
      setShowZeros(order.status === orderStatuses.OPENED);
      setTableSorting(null);
      setUserMadeChanges(false);
    }
  }, [order]);

  React.useEffect(() => {
    const itemsViewFromItems = items.filter(
      (i) => categoriesMenu[i.category] && (showZeros || i.count)
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

  React.useEffect(() => {
    error && setShowErrorToast(true);
  }, [error]);
  //#endregion

  //#region UI HANDLERS

  const handleDateChange = (date) => {
    if (userMadeChanges) {
      messageBox({
        variant: "prompt",
        catchOnCancel: true,
        title: "Незбережені зміни",
        description: "В замовленні є незбережені зміни. Відхилити?",
      })
        .then(() => {
          setOrderDate(date);
        })
        .catch(() => {});
    } else {
      setOrderDate(date);
    }
  };

  const handlePosChange = (newPos) => {
    if (userMadeChanges) {
      messageBox({
        variant: "prompt",
        catchOnCancel: true,
        title: "Незбережені зміни",
        description: "В замовленні є незбережені зміни. Відхилити?",
      })
        .then(() => {
          setPos(newPos);
        })
        .catch(() => {});
    } else {
      setPos(newPos);
    }
  };

  const handleItemsMenuButtonClick = (event) => {
    setAnchorItemsMenu(event.currentTarget);
  };

  const handleItemsMenuClose = () => {
    setAnchorItemsMenu(null);
  };

  const handelCategoryCheck = (category, value) => {
    setCategoriesMenu({
      ...categoriesMenu,
      [category]: value,
    });
  };

  const handleItemClick = (item) => {
    if (order.status !== orderStatuses.FINALIZED) {
      setSelectedItem({ ...item });
      setShowQuantityDialog(true);
    }
  };

  const handleQuantityDialogClose = (confirmed) => {
    if (confirmed) {
      setItems(
        items.map((i) =>
          i.goodID === selectedItem.goodID ? { ...selectedItem } : i
        )
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
    setShowOrderSummary(true);
  };

  const handleItemQuantityChange = (quantity) => {
    setSelectedItem({
      ...selectedItem,
      count: quantity,
    });
    userMadeChanges || setUserMadeChanges(true);
  };

  const handleSaveDayClick = () => {
    saveDay(
      orderDate,
      pos.posID,
      items
        .filter((i) => i.count && i.oldCount !== i.count)
        .map((i) => ({ goodID: i.goodID, count: i.count }))
    );
    setShowOrderSummary(false);
  };

  const handleChangeOrderStatus = (status) => {
    if (userMadeChanges) {
      messageBox({
        variant: "prompt",
        catchOnCancel: true,
        title: "Незбережені зміни",
        description: "В замовленні є незбережені зміни. Відхилити?",
      })
        .then(() => {
          changeDayStatus(orderDate, pos.posID, status);
        })
        .catch(() => {});
    } else {
      changeDayStatus(orderDate, pos.posID, status);
    }
    setAnchorItemsMenu(null);
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

  const calcCountCoumnHederFromOrderStatus = () => {
    switch (order.status) {
      case orderStatuses.OPENED:
        return "Замовити";
      case orderStatuses.CLOSED:
        return "Замовлено";
      default:
        return "Прийнято";
    }
  };

  return (
    <React.Fragment>
      <div className={classes.root}>
        <div className={classes.optionsBar}>
          <KhDatePicker
            value={moment(orderDate).valueOf()}
            onChange={handleDateChange}
            style={{ margin: 5 }}
          />

          <PosSelect
            style={{ margin: 5 }}
            onChange={handlePosChange}
            value={pos}
          />
        </div>

        {!(order && pos) ? null : (
          <Paper className={classes.list}>
            <table
              className={classNames(classes.itemsTable, classes.unselectable)}
            >
              <tbody>
                <tr>
                  <th>
                    {generateTableHeader("goodName", "flex-start", "Товари")}
                  </th>
                  <th>
                    {generateTableHeader(
                      "count",
                      "flex-end",
                      calcCountCoumnHederFromOrderStatus()
                    )}
                  </th>
                </tr>

                {itemsView.map((item, i) => (
                  <tr
                    key={i}
                    onClick={() => {
                      handleItemClick(item);
                    }}
                  >
                    <td>{item.goodName}</td>
                    <td className={classes.textAlignRight}>
                      {item.count}
                      <Typography
                        variant="caption"
                        className={classes.cellHint}
                      >
                        {item.units}
                      </Typography>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Paper>
        )}

        {pos ? null : (
          <Typography variant="h5" className={classes.actionHint}>
            оберіть точку продажу
          </Typography>
        )}

        {!(pos && !order && !error) ? null : (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <CircularProgress style={{ margin: "30px auto" }} />
          </div>
        )}
      </div>

      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        position="fixed"
        bottom={theme.spacing(4)}
        right={theme.spacing(4)}
      >
        {!Object.keys(categoriesMenu).length ? null : (
          <Fab
            color="default"
            onClick={handleItemsMenuButtonClick}
            size="small"
            className={classes.fab}
          >
            <MoreVert />
          </Fab>
        )}
        {!userMadeChanges ? null : (
          <Fab
            color="primary"
            onClick={handleShowSummaryClick}
            className={classes.fab}
          >
            <Check />
          </Fab>
        )}
      </Box>

      <Menu
        className={classes.itemsMenuContainer}
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
              {selectedItem.goodName}
            </DialogTitle>
            <DialogContent>
              <Box display="flex" justifyContent="center">
                <TextField
                  type="number"
                  variant="outlined"
                  value={selectedItem.count}
                  inputProps={{ min: 0 }}
                  onChange={(e) => {
                    handleItemQuantityChange(+e.target.value);
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

      {order && pos ? (
        <Dialog
          fullScreen
          open={showOrderSummary}
          onClose={() => {
            setShowOrderSummary(false);
          }}
        >
          <PrintView
            items={items}
            orderDate={moment(orderDate).format("DD.MM.YYYY")}
            pos={pos.posIDName}
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
              <Button onClick={handleSaveDayClick} color="primary">
                Зберегти
              </Button>
            </Box>
          )}
        </Dialog>
      ) : null}

      <Prompt
        when={userMadeChanges}
        message={() => "Впевнені що не бажаєте зберегти замовлення?"}
      />

      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        open={showErrorToast}
        onClose={() => {
          setShowErrorToast(false);
        }}
      >
        <SnackbarContent
          style={{
            backgroundColor: theme.palette.error.main,
            textAlign: "center",
          }}
          message={<Typography id="client-snackbar">{error}</Typography>}
        />
      </Snackbar>
    </React.Fragment>
  );
  //#endregion
}

const mapStateToProps = (state) => ({
  order: state.orderManagement.order,
  error: state.orderManagement.errorMessage,
});

const mapDispatchToProps = (dispatch) => ({
  getDay: (date, posID) => {
    dispatch(thunkApiGetDay(date, posID));
  },
  saveDay: (date, posID, items) => {
    dispatch(thunkApiPatchDay(date, posID, items));
  },
  changeDayStatus: (date, posID, status) => {
    dispatch(thunkChangeDayStatus(date, posID, status));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(OrderManagement);
