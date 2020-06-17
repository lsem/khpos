import React from "react";
import { connect } from "react-redux";
import { Switch, Route, useHistory, useRouteMatch } from "react-router-dom";
import moment from "moment";
import _ from "lodash";
import { thunkGetAggregatedFromApi } from "./orderProductionSlice";
import { makeStyles } from "@material-ui/core/styles";
import { CircularProgress } from "@material-ui/core";

import { AllPosId } from "../pos/PosSelect";
import ItemDetails from "./ItemDetails";
import OptionsBar from "./OptionsBar";
import ItemsTable from "./ItemsTable";
import Fabs from "./Fabs";
import OrderProductionMenu from "./Menu";
import { orderProductionRoutes } from "../../constants/routes";

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
}));

//#endregion

function OrderProduction({ aggregated, getAggregated }) {
  const { path } = useRouteMatch();
  const { url } = useRouteMatch();
  const history = useHistory();
  const classes = useStyles();

  const [pos, setPos] = React.useState(null);
  const [date, setDate] = React.useState(moment().valueOf());
  const [items, setItems] = React.useState([]);
  const [itemsView, setItemsView] = React.useState([]);
  const [showSpinner, setShowSpinner] = React.useState(false);
  const [tableSorting, setTableSorting] = React.useState(null);
  const [categoriesMenu, setCategoriesMenu] = React.useState({});
  const [anchorItemsMenu, setAnchorItemsMenu] = React.useState(null);

  //#region EFFECTS
  React.useEffect(() => {
    setShowSpinner(true);
    getAggregated(date);
  }, [date, getAggregated]);

  React.useEffect(() => {
    if (aggregated) {
      setItems(JSON.parse(JSON.stringify(aggregated.items)));
      setTableSorting(null);
      setShowSpinner(false);
    }
  }, [aggregated]);

  React.useEffect(() => {
    if (!(items && pos)) return;

    if (pos.id === AllPosId) {
      setItemsView([...items]);
    } else {
      const fromDetails = [];

      items.forEach((i) => {
        const foundInDetails = i.details.find((d) => d.posID === pos.id);
        if (foundInDetails)
          fromDetails.push({ ...i, count: foundInDetails.count });
      });
      setItemsView(fromDetails);
    }
  }, [items, pos]);

  React.useEffect(() => {
    const itemsViewFromItems = items.filter((i) => categoriesMenu[i.category]);
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
  }, [items, categoriesMenu, tableSorting]);

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
  }, [items]);
  //#endregion

  //#region UI HANDLERS
  const handleItemClick = (item) => {
    history.push(`${url}/${orderProductionRoutes.itemDetails}`, item);
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
  //#endregion

  return (
    <Switch>
      <Route exact path={`${path}/${orderProductionRoutes.itemDetails}`}>
        <ItemDetails/>
      </Route>
      <Route path={`${path}`}>
        <React.Fragment>
          <div className={classes.root}>
            <OptionsBar
              orderDate={date}
              onDateChange={setDate}
              pos={pos}
              onPosChange={setPos}
            />

            {!aggregated ? null : (
              <ItemsTable
                handleTableSort={handleTableSort}
                tableSorting={tableSorting}
                itemsView={itemsView}
                handleItemClick={handleItemClick}
              />
            )}

            <CircularProgress
              style={{
                margin: "30px auto",
                display: showSpinner ? "block" : "none",
              }}
            />

            <Fabs
              categoriesMenu={categoriesMenu}
              handleItemsMenuButtonClick={handleItemsMenuButtonClick}
            />

            <OrderProductionMenu
              categoriesMenu={categoriesMenu}
              anchorItemsMenu={anchorItemsMenu}
              handelCategoryCheck={handelCategoryCheck}
              handleItemsMenuClose={handleItemsMenuClose}
            />
          </div>
        </React.Fragment>
      </Route>
    </Switch>
  );
}

const mapStateToProps = (state) => ({
  aggregated: state.orderProduction.aggregated,
  error: state.orderProduction.errorMessage,
});

const mapDispatchToProps = (dispatch) => ({
  getAggregated: (date) => {
    dispatch(thunkGetAggregatedFromApi(date));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(OrderProduction);
