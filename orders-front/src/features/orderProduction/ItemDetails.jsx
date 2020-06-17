import React from "react";
import { useLocation, useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";

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

function ItemDetails() {
  const classes = useStyles();
  const location = useLocation();
  const history = useHistory();
  const item = location.state;

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
          {item.details.map((d, i) => (
            <tr key={i}>
              <td>{d.posIDName}</td>
              <td>
                {d.count} {item.units}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Button
        variant="outlined"
        onClick={() => {
          history.goBack();
        }}
        color="secondary"
      >
        Назад
      </Button>
    </div>
  );
}

export default ItemDetails;
