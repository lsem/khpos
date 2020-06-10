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
  orderDate,
  pos,
}) {
  const classes = useStyles();

  const itemsView = _(items)
    .filter((i) => i.oldCount + i.count > 0 && i.oldCount !== i.count)
    .groupBy("category")
    .valueOf();

  let key = 0;

  return (
    <div className={classes.root}>
      <Typography variant="h5">{pos}</Typography>
      <Typography variant="h5">{orderDate}</Typography>
      <table>
        <tbody>
          <tr>
            <th>Товар</th>
            <th>До</th>
            <th>Після</th>
          </tr>
          {Object.keys(itemsView).map((c, i) => (
            <React.Fragment key={i}>
              <tr>
                <th colSpan={3}>{c}</th>
              </tr>
              {itemsView[c].map((g, j) => (
                <tr key={key++}>
                  <td>{g.goodName}</td>
                  <td>
                    {g.oldCount} {g.units}
                  </td>
                  <td>
                    {g.count} {g.units}
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
