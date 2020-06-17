import React from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import classNames from "classnames";
import { makeStyles } from "@material-ui/core/styles";
import {
  TextField,
  Typography,
  Paper,
  Box,
  InputAdornment,
} from "@material-ui/core";
import { ArrowDropDown, Search, History } from "@material-ui/icons";

import orderStatuses from "../../constants/orderStatuses";
import { orderManagementRoutes } from "../../constants/routes";

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 800,
    margin: "0 auto",
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
      backgroundColor: theme.palette.background.paper,
    },
    "& td": {
      padding: theme.spacing(2),
      borderColor: theme.palette.divider,
      borderStyle: "solid",
      borderWidth: "0 0 1px 0",
      "&>svg": {
        verticalAlign: "middle",
        margin: "-3px 10px 0 0",
      },
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
  aster: {
    display: "inline-block",
    verticalAlign: "top",
    marginTop: "-.5em",
    marginBottom: ".5em",
  },
  textAlignRight: {
    textAlign: "right !important",
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
  cellHint: {
    color: theme.palette.text.hint,
    marginLeft: 10,
  },
}));

export default function ItemsTable({
  orderStatus,
  handleSort,
  handleSearch,
  sorting,
  items,
  handleItemClick,
}) {
  const history = useHistory();
  const { url } = useRouteMatch();
  const classes = useStyles();

  const calcCountCoumnHederFromOrderStatus = () => {
    switch (orderStatus) {
      case orderStatuses.OPENED:
        return "Замовити";
      case orderStatuses.CLOSED:
        return "Замовлено";
      default:
        return "Прийнято";
    }
  };

  const generateTableHeader = (columnName, justifyContent, content) => {
    return (
      <Box
        display="flex"
        alignItems="center"
        bgcolor="transparent"
        padding={2}
        justifyContent={justifyContent}
      >
        <span
          onClick={() => {
            handleSort(columnName);
          }}
        >
          {content}
        </span>
        <ArrowDropDown
          className={classNames({
            [classes.sortIconInvisible]: true,
            [classes.sortIconAsc]:
              sorting &&
              sorting.column === columnName &&
              sorting.order === "ASC",
            [classes.sortIconDsc]:
              sorting &&
              sorting.column === columnName &&
              sorting.order === "DSC",
          })}
        />
        {columnName === "goodName" && (
          <TextField
            type="search"
            onChange={(e) => {
              handleSearch(e.target.value);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="disabled" />
                </InputAdornment>
              ),
            }}
          />
        )}
      </Box>
    );
  };

  return (
    <Paper className={classes.root}>
      <table className={classNames(classes.itemsTable, classes.unselectable)}>
        <tbody>
          <tr>
            <th>{generateTableHeader("goodName", "flex-start", "Товари")}</th>
            <th>
              {generateTableHeader(
                "count",
                "flex-end",
                calcCountCoumnHederFromOrderStatus()
              )}
            </th>
          </tr>

          {items.map((item, i) => (
            <tr
              key={i}
              onClick={() => {
                handleItemClick(item);
              }}
            >
              <td>{item.goodName}</td>
              <td className={classes.textAlignRight}>
                {!!item.history.length && (
                  <History
                    color="disabled"
                    onClick={(e) => {
                      e.stopPropagation();
                      history.push(
                        `${url}/${orderManagementRoutes.itemLog}`,
                        item
                      );
                    }}
                  />
                )}
                {item.count}
                {item.status !== "Default" && (
                  <span className={classes.aster}>*</span>
                )}
                <Typography variant="caption" className={classes.cellHint}>
                  {item.units}
                </Typography>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Paper>
  );
}
