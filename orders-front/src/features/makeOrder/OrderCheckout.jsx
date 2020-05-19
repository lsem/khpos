import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Paper, Typography, Button } from "@material-ui/core";

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
  paper: {
    backgroundColor: theme.palette.background.default,
    marginBottom: 20,
  },
  buttonBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: 10,
    "& button": {
      margin: 10,
    },
  },
}));

export default function OrderCheckout(props) {
  const classes = useStyles();

  const orderedGoods = props.orderedGoods;
  let key = 0;

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <table>
          <tbody>
            <tr>
              <th>Категорія</th>
              <th>Товар</th>
              <th>К-сть</th>
            </tr>
            {Object.keys(orderedGoods).map((c, i) =>
              orderedGoods[c].map((g, j) =>
                !j ? (
                  <tr key={key++}>
                    <th rowSpan={orderedGoods[c].length}>{c}</th>
                    <td>{g.name}</td>
                    <td>{g.quantity}</td>
                  </tr>
                ) : (
                  <tr key={key++}>
                    <td>{g.name}</td>
                    <td>{g.quantity}</td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </Paper>

      <Typography variant="h5">Зберегти замовлення?</Typography>

      <div className={classes.buttonBar}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={props.closeCheckout}
        >
          Ні
        </Button>
        <Button variant="outlined" color="primary">
          Так
        </Button>
      </div>
    </div>
  );
}
