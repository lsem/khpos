import React from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  useMediaQuery,
  Menu,
  MenuItem,
} from "@material-ui/core";
import { Menu as MenuIcon, AccountCircle } from "@material-ui/icons";
import { NavLink, useHistory } from "react-router-dom";
import { connect } from "react-redux";
import routes from "../../constants/routes";
import { resetAuth } from "../auth/authSlice";

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

function ApplicationBar({ openMenuDrawer, loggedIn, logOut, userName }) {
  const classes = useStyles();
  const theme = useTheme();
  const matchesSmall = useMediaQuery(theme.breakpoints.down("xs"));
  const history = useHistory();

  const [anchorUserMenu, setAnchorUserMenu] = React.useState(null);

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
          <Button
            color="inherit"
            startIcon={<AccountCircle />}
            aria-controls="user-menu"
            aria-haspopup="true"
            onClick={(e) => {
              setAnchorUserMenu(e.currentTarget);
            }}
          >
            {userName}
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

      <Menu
        id="user-menu"
        anchorEl={anchorUserMenu}
        keepMounted
        open={!!anchorUserMenu}
        onClose={() => {
          setAnchorUserMenu(null);
        }}
      >
        <MenuItem
          onClick={() => {
            setAnchorUserMenu(null);
            history.push(routes.logout);
          }}
        >
          Вийти
        </MenuItem>
      </Menu>
    </AppBar>
  );
}

const mapStateToProps = (state) => ({
  loggedIn: state.auth.loggedIn,
  userName: state.auth.userName,
});

const mapDispatchToProps = (dispatch) => ({
  logOut: () => {
    dispatch(resetAuth());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ApplicationBar);
