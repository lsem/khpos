import React from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Drawer,
} from "@material-ui/core";
import { NavLink } from "react-router-dom";
import routeConsts from "../../constants/routes";
import { Assignment } from "@material-ui/icons";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: drawerWidth,
    borderRight: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    height: "100%",
    [theme.breakpoints.down("xs")]: {
      display: "none",
    },
  },
}));

function AppMainMenu({ showDrawer, closeDrawer }) {
  const classes = useStyles();
  const theme = useTheme();
  const container = window ? () => window.document.body : undefined;

  const menu = (
    <List>
      <ListItem
        button
        component={NavLink}
        to={`/${routeConsts.orderManagement}`}
        activeClassName="Mui-selected"
        onClick={() => {
          closeDrawer();
        }}
      >
        <ListItemIcon style={{minWidth: 36}}>
          <Assignment />
        </ListItemIcon>
        <ListItemText primary={"Замовлення"} />
      </ListItem>
      <Divider />
    </List>
  );

  return (
    <React.Fragment>
      <div className={classes.root}>{menu}</div>

      <Drawer
        container={container}
        variant="temporary"
        anchor={theme.direction === "rtl" ? "right" : "left"}
        transitionDuration={100}
        open={showDrawer}
        onClose={closeDrawer}
        classes={{
          paper: classes.drawerPaper,
        }}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
      >
        {menu}
      </Drawer>
    </React.Fragment>
  );
}

export default AppMainMenu;
