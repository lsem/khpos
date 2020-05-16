import React, { useState } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {
  TextField,
  Fab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Collapse,
  Divider,
} from "@material-ui/core";
import { AssignmentTurnedIn, ExpandLess, ExpandMore } from "@material-ui/icons";
import moment from "moment";
import _ from "lodash";
import goods from "../../samples/goods.json";

const useStyles = makeStyles((theme) => ({
  list: {
    maxWidth: 800,
    margin: "0 auto"
  },
  fab: {
    position: "fixed",
    bottom: theme.spacing(4),
    right: theme.spacing(4),
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 80,
  },
  dateField: {
    display: "block",
    maxWidth: 150,
    margin: "20px auto 5px auto",
  },
  button: {
    margin: theme.spacing(1),
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
}));

function MakeOrder() {
  const theme = useTheme();
  const classes = useStyles();

  const [state, setState] = useState({
    categories: _(goods)
      .uniqBy((g) => g.category)
      .map((o) => {
        return { category: o.category, expanded: false };
      })
      .valueOf(),

    goodsWithQty: goods.map((g) => {
      return { ...g, quantity: 0 };
    }),
  });

  const handleExpandClick = (category) => {
    setState({
      ...state,
      categories: state.categories.map((c) =>
        c.category !== category.category
          ? c
          : {
              ...category,
              expanded: !category.expanded,
            }
      ),
    });
  };

  return (
    <React.Fragment>
      <div>
        <TextField
          id="date"
          label="Дата замовлення"
          type="date"
          defaultValue={moment().add(1, "days").format("YYYY-MM-DD")}
          className={classes.dateField}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <List className={classes.list}>
          {state.categories.map((c, i) => (
            <React.Fragment key={i}>
              <ListItem button onClick={() => handleExpandClick(c)}>
                <ListItemText primary={c.category} />
                {c.expanded ? <ExpandLess /> : <ExpandMore />}
              </ListItem>

              <Collapse in={c.expanded} timeout={0} unmountOnExit>
                <List component={List} disablePadding>
                  {_(state.goodsWithQty)
                    .filter((g) => g.category !== c.category)
                    .sortBy("name")
                    .map((g, i) => (
                      <ListItem
                        button
                        className={classes.nested}
                        key={i}
                        style={{
                          backgroundColor:
                            i % 2
                              ? theme.palette.background.default
                              : theme.palette.background.paper,
                        }}
                      >
                        <ListItemText primary={g.name} />
                        <ListItemSecondaryAction>
                          <TextField
                            className={classes.textField}
                            defaultValue={g.quantity}
                            type="number"
                            id="outlined-basic"
                            label=""
                            variant="outlined"
                            size="small"
                            onFocus={(event) => {
                              event.target.select();
                            }}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))
                    .valueOf()}
                </List>
              </Collapse>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </div>

      <Fab color="primary" className={classes.fab}>
        <AssignmentTurnedIn />
      </Fab>
    </React.Fragment>
  );
}

export default MakeOrder;
