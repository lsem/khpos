import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import _ from "lodash";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(2),
    margin: 0,
    "& table": {
      margin: 20,
    },
    "& table, th, td": {
      border: "1px dashed",
      borderColor: theme.palette.text.primary,
      borderCollapse: "collapse",
    },
    "& th, td": {
      padding: 10,
    },
  },
}));

export default function PrintView({
  items,
  orderStatus,
  orderDate,
  sellPoint,
}) {
  const classes = useStyles();

  const itemsView = _(items)
    .filter((i) => i.orderedcount + i.deliveredcount > 0)
    .groupBy("category")
    .valueOf();

  let key = 0;

  return (
    <div className={classes.root}>
      <Typography variant="h5">{sellPoint}</Typography>
      <Typography variant="h5">{orderDate}</Typography>
      <table>
        <tbody>
          <tr>
            <th>Товар</th>
            <th>Замовлено</th>
            {orderStatus === "new" ? null : <th>Прийнято</th>}
          </tr>
          {Object.keys(itemsView).map((c, i) => (
            <React.Fragment key={i}>
              <tr>
                <th colSpan={orderStatus === "new" ? 2 : 3}>{c}</th>
              </tr>
              {itemsView[c].map((g, j) => (
                <tr key={key++}>
                  <td>{g.name}</td>
                  <td>
                    {g.orderedcount} {g.units}
                  </td>
                  {orderStatus === "new" ? null : (
                    <td>
                      {g.deliveredcount} {g.units}
                    </td>
                  )}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
