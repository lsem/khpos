import React from "react";
import { useLocation } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import moment from "moment";
import itemLogColumnNames from "../../constants/itemLogColumnNames";
import ItemLogActionKinds from "../../constants/ItemLogActionKinds";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    paddingTop: theme.spacing(2),
    "&>*": {
      marginTop: theme.spacing(1),
    },
    "&>table": {
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[1],
      borderRadius: 3,
      oferflow: "hidden",
      borderCollapse: "collapse",
      marginTop: theme.spacing(3),
      "& th, td": {
        padding: `${theme.spacing(2)}px ${theme.spacing(1)}px`,
      },
      "& td": {
        borderTop: `1px solid ${theme.palette.divider}`,
      },
    },
  },
}));

function ItemLog() {
  const classes = useStyles();
  const location = useLocation();
  const item = location.state;

  const numToStr = (num) => {
    if (num <= 0) return num;
    return `+${num}`;
  };

  return (
    <div className={classes.root}>
      <Typography variant="h6">Історія замовлення "{item.goodName}"</Typography>
      <Typography variant="h6">
        {moment(item.history[0].whenTS).format("DD.MM.YYYY")}
      </Typography>

      <table>
        <thead>
          <tr>
            <th>{itemLogColumnNames.kind}</th>
            <th>{itemLogColumnNames.count}</th>
            <th>{itemLogColumnNames.diff}</th>
            <th>{itemLogColumnNames.userName}</th>
            <th>{itemLogColumnNames.whenTS}</th>
          </tr>
        </thead>
        <tbody>
          {item.history.map((a) => (
            <tr>
              <td>{ItemLogActionKinds[a.kind]}</td>
              <td>{a.count}</td>
              <td>{numToStr(a.diff)}</td>
              <td>{a.userName}</td>
              <td>{moment(a.whenTS).format("HH:mm:ss")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ItemLog;
