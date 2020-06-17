import React from "react";
import classNames from "classnames";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Typography, Paper } from "@material-ui/core";
import { ArrowDropDown } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 800,
    margin: "0 auto",
  },
  unselectable: {
    userSelect: "none",
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

export default function ItemsTable({
  handleTableSort,
  tableSorting,
  itemsView,
  handleItemClick,
}) {
  const classes = useStyles();

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
    <Paper className={classes.root}>
      <table className={classNames(classes.itemsTable, classes.unselectable)}>
        <tbody>
          <tr>
            <th>
              {generateTableHeader("productName", "flex-start", "Товари")}
            </th>
            <th>{generateTableHeader("count", "flex-end", "Замовлено")}</th>
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
