import React from "react";
import { connect } from "react-redux";
import moment from "moment";
import classNames from "classnames";
import _ from "lodash";

import { thunkGetAggregatedFromApi } from "./orderProductionSlice";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Fab,
  Menu,
  FormControlLabel,
  Checkbox,
  Dialog,
} from "@material-ui/core";
import { ArrowDropDown, MoreVert, Print } from "@material-ui/icons";
import KhDatePicker from "../datePicker/KhDatePicker";
import PosSelect, { AllPosId } from "../pos/PosSelect";
import ItemDetails from "./ItemDetails";

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
    right: theme.spacing(4),
  },
  fabMenu: {
    position: "fixed",
    bottom: theme.spacing(12),
    right: theme.spacing(5),
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
}));

//#endregion

function OrderProduction({ aggregated, getAggregated }) {
  const classes = useStyles();

  const [pos, setPos] = React.useState(null);
  const [date, setDate] = React.useState(moment().valueOf());
  const [items, setItems] = React.useState([]);
  const [itemsView, setItemsView] = React.useState([]);
  const [showSpinner, setShowSpinner] = React.useState(false);
  const [tableSorting, setTableSorting] = React.useState(null);
  const [selectedItem, setSelectedItem] = React.useState(null);
  const [categoriesMenu, setCategoriesMenu] = React.useState({});
  const [anchorItemsMenu, setAnchorItemsMenu] = React.useState(null);
  const [showItemDetailsDialog, setShowItemDetailsDialog] = React.useState(
    false
  );

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
    setSelectedItem({ ...item });
    setShowItemDetailsDialog(true);
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
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexWrap="wrap"
          margin="16px 0"
        >
          <KhDatePicker value={date} onChange={setDate} />
          <PosSelect
            style={{ margin: 5 }}
            onChange={setPos}
            addAll
            allSelectedByDefault
          />
        </Box>

        {!aggregated ? null : (
          <Box maxWidth={800} margin="0 auto">
            <Paper>
              <table
                className={classNames(classes.itemsTable, classes.unselectable)}
              >
                <tbody>
                  <tr>
                    <th>
                      {generateTableHeader(
                        "productName",
                        "flex-start",
                        "Товари"
                      )}
                    </th>
                    <th>
                      {generateTableHeader("count", "flex-end", "Замовлено")}
                    </th>
                  </tr>

                  {itemsView.map((item, i) => (
                    <tr
                      key={i}
                      onClick={() => {
                        handleItemClick(item);
                      }}
                    >
                      <td>{item.productName}</td>
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
          </Box>
        )}

        <CircularProgress
          style={{
            margin: "30px auto",
            display: showSpinner ? "block" : "none",
          }}
        />

        {!Object.keys(categoriesMenu).length ? null : (
          <Fab
            color="default"
            className={classes.fabMenu}
            onClick={handleItemsMenuButtonClick}
            size="small"
          >
            <MoreVert />
          </Fab>
        )}
        <Fab color="primary" className={classes.fab}>
          <Print />
        </Fab>

        <Menu
          className={classes.itemsMenuContainer}
          anchorEl={anchorItemsMenu}
          keepMounted
          open={Boolean(anchorItemsMenu)}
          onClose={handleItemsMenuClose}
          disableAutoFocusItem
          variant="menu"
        >
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
          open={showItemDetailsDialog}
          onClose={() => {
            setShowItemDetailsDialog(false);
          }}
        >
          <ItemDetails item={selectedItem} />
        </Dialog>
      </div>
    </React.Fragment>
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
