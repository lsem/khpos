//#region IMPORTS
import React from "react";
import routes, { orderManagementRoutes } from "../../constants/routes";
import { Switch, Route, Prompt, useRouteMatch } from "react-router-dom";
import { connect } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, CircularProgress } from "@material-ui/core";
import moment from "moment";
import _ from "lodash";
import {
  thunkApiGetDayByPos,
  thunkApiPatchDay,
  thunkChangeDayStatus,
} from "./orderManagementSlice";
import orderStatuses from "../../constants/orderStatuses";
import { useMessageBox } from "../messageBox/MessageBoxService";
import ItemsTable from "./ItemsTable";
import OptionsBar from "./OptionsBar";
import Fabs from "./Fabs";
import OrderMenu from "./Menu";
import QuantityDialog from "./QuantityDialog";
import ItemLog from "./ItemLog";
import OrderSummary from "./OrderSummary";
import { thunkApiGetDayAllPos } from "./orderManagementSlice";
import { AllPosId } from "../pos/PosSelect";
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
  formControl: {
    margin: theme.spacing(1),
    minWidth: 140,
  },
  actionHint: {
    textAlign: "center",
    margin: theme.spacing(6),
    color: theme.palette.text.hint,
  },
}));

//#endregion

function OrderManagement({
  getDay,
  saveDay,
  changeDayStatus,
  order,
  error,
  userRole,
  getDayAllPos,
}) {
  const classes = useStyles();
  const { path } = useRouteMatch();
  const messageBox = useMessageBox();

  //#region STATE
  const [orderDate, setOrderDate] = React.useState(
    moment().add(1, "days").valueOf()
  );
  const [posId, setPosId] = React.useState(null);
  const [posName, setPosName] = React.useState(null);
  const [showQuantityDialog, setShowQuantityDialog] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState(null);
  const [categoriesMenu, setCategoriesMenu] = React.useState({});
  const [items, setItems] = React.useState([]);
  const [itemsView, setItemsView] = React.useState([]);
  const [anchorItemsMenu, setAnchorItemsMenu] = React.useState(null);
  const [showZeros, setShowZeros] = React.useState(true);
  const [tableSorting, setTableSorting] = React.useState(null);
  const [userMadeChanges, setUserMadeChanges] = React.useState(false);
  const [searchString, setSearchString] = React.useState("");
  //#endregion

  //#region EFFECTS
  React.useEffect(() => {
    if (!posId) return;

    if (posId === AllPosId) {
      getDayAllPos(moment(orderDate).valueOf());
    } else {
      getDay(moment(orderDate).valueOf(), posId);
    }
  }, [orderDate, posId, getDay, getDayAllPos]);

  React.useEffect(() => {
    if (order) {
      setItems(
        JSON.parse(JSON.stringify(order.items)).map((i) => ({
          ...i,
          oldCount: i.count,
        }))
      );
      setShowZeros(
        order.status !== orderStatuses.FINALIZED && posId !== AllPosId
      );
      setTableSorting(null);
      setUserMadeChanges(false);
    }
  }, [order, posId]);

  React.useEffect(() => {
    const itemsViewFromItems = items.filter(
      (i) =>
        categoriesMenu[i.category] &&
        (showZeros || i.count) &&
        i.goodName.toLowerCase().includes(searchString.toLowerCase())
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
  }, [items, categoriesMenu, showZeros, tableSorting, searchString]);

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
  const searchHandler = React.useCallback(
    _.debounce((str) => {
      setSearchString(str);
    }, 300),
    [setSearchString]
  );

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

  const handlePosChange = (newPosId, newPosName) => {
    if (userMadeChanges) {
      messageBox({
        variant: "prompt",
        catchOnCancel: true,
        title: "Незбережені зміни",
        description: "В замовленні є незбережені зміни. Відхилити?",
      })
        .then(() => {
          setPosId(newPosId);
          setPosName(newPosName);
        })
        .catch(() => {});
    } else {
      setPosId(newPosId);
      setPosName(newPosName);
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
    if (order.status !== orderStatuses.FINALIZED && posId !== AllPosId) {
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
      posId,
      items
        .filter((i) => i.count && i.oldCount !== i.count)
        .map((i) => ({ goodID: i.goodID, count: i.count }))
    );
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
          changeDayStatus(orderDate, posId, status);
        })
        .catch(() => {});
    } else {
      changeDayStatus(orderDate, posId, status);
    }
    setAnchorItemsMenu(null);
  };
  //#endregion

  //#region JSX
  return (
    <Switch>
      <Route exact path={`${path}/${orderManagementRoutes.itemLog}`}>
        <ItemLog />
      </Route>
      <Route exact path={`${path}/${orderManagementRoutes.summary}`}>
        <OrderSummary
          pos={posName}
          items={items}
          orderDate={orderDate}
          handleSaveDayClick={handleSaveDayClick}
        />
      </Route>
      <Route path={`${path}`}>
        <React.Fragment>
          <div className={classes.root}>
            <OptionsBar
              orderDate={orderDate}
              posId={posId}
              handleDateChange={handleDateChange}
              handlePosChange={handlePosChange}
              userRole={userRole}
            />

            {order && posId && (
              <ItemsTable
                orderStatus={order.status}
                handleSort={handleTableSort}
                handleSearch={searchHandler}
                sorting={tableSorting}
                items={itemsView}
                handleItemClick={handleItemClick}
              />
            )}

            {!posId && (
              <Typography variant="h5" className={classes.actionHint}>
                оберіть точку продажу
              </Typography>
            )}

            {posId && !order && !error && (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <CircularProgress style={{ margin: "30px auto" }} />
              </div>
            )}
          </div>

          <Fabs
            categoriesMenu={categoriesMenu}
            userMadeChanges={userMadeChanges}
            handleItemsMenuButtonClick={handleItemsMenuButtonClick}
          />

          <OrderMenu
            order={order}
            showZeros={showZeros}
            setShowZeros={setShowZeros}
            categoriesMenu={categoriesMenu}
            anchorItemsMenu={anchorItemsMenu}
            handelCategoryCheck={handelCategoryCheck}
            handleItemsMenuClose={handleItemsMenuClose}
            handleChangeOrderStatus={handleChangeOrderStatus}
          />

          <QuantityDialog
            order={order}
            selectedItem={selectedItem}
            showQuantityDialog={showQuantityDialog}
            handleItemQuantityChange={handleItemQuantityChange}
            handleQuantityDialogClose={handleQuantityDialogClose}
          />

          <Prompt
            message={(params) => {
              return userMadeChanges &&
                !params.pathname.includes(routes.orderManagement)
                ? "Впевнені що не бажаєте зберегти замовлення?"
                : true;
            }}
          />
        </React.Fragment>
      </Route>
    </Switch>
  );
  //#endregion
}

const mapStateToProps = (state) => ({
  order: state.orderManagement.order,
  userRole: state.auth.role,
});

const mapDispatchToProps = (dispatch) => ({
  getDay: (date, posID) => {
    dispatch(thunkApiGetDayByPos(date, posID));
  },
  getDayAllPos: (date) => {
    dispatch(thunkApiGetDayAllPos(date));
  },
  saveDay: (date, posID, items) => {
    dispatch(thunkApiPatchDay(date, posID, items));
  },
  getAll: (date, posID, items) => {
    dispatch(thunkApiPatchDay(date, posID, items));
  },
  changeDayStatus: (date, posID, status) => {
    dispatch(thunkChangeDayStatus(date, posID, status));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(OrderManagement);
