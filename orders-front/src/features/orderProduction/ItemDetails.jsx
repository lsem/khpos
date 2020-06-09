import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: 20,
    textAlign: "center",
    "& table": {
      margin: "10px auto",
      borderCollapse: "collapse",
      "& th, td": {
        padding: 10,
        border: `1px dashed ${theme.palette.divider}`,
      },
      "& td": {
        "&:nth-child(even)": { textAlign: "right" },
        "&:nth-child(odd)": { textAlign: "left" },
      },
    },
  },
}));

function ItemDetails({ item }) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <h3>{item.productName}</h3>
      <table>
        <thead>
          <tr>
            <th>Точка</th>
            <th>К-сть</th>
          </tr>
        </thead>
        <tbody>
          {item.details.map((d) => (
            <tr>
              <td>{d.posIDName}</td>
              <td>
                {d.count} {item.units}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ItemDetails;
