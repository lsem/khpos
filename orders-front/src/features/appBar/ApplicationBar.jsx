import React from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  useMediaQuery,
} from "@material-ui/core";
import { Menu as MenuIcon, AccountCircle } from "@material-ui/icons";
import { NavLink } from "react-router-dom";
import { connect } from "react-redux";
import routes from "../../constants/routes";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

function ApplicationBar({ openMenuDrawer, loggedIn }) {
  const classes = useStyles();
  const theme = useTheme();
  const matchesSmall = useMediaQuery(theme.breakpoints.down("xs"));

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          edge="start"
          className={classes.menuButton}
          color="inherit"
          aria-label="menu"
          style={{ display: matchesSmall ? "flex" : "none" }}
          onClick={openMenuDrawer}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" className={classes.title}>
          KH Orders
        </Typography>
        {loggedIn ? (
          <Button color="inherit" startIcon={<AccountCircle />}>
            Вийти
          </Button>
        ) : (
          <Button
            color="inherit"
            startIcon={<AccountCircle />}
            component={NavLink}
            to={`${routes.login}`}
          >
            Увійти
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

const mapStateToProps = (state) => ({
  loggedIn: state.auth.authenticated,
});

const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ApplicationBar);
