import React from "react";
//import useMediaQuery from "@material-ui/core/useMediaQuery";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import { Switch, Route, Redirect, useHistory } from "react-router-dom";
import { connect } from "react-redux";

import ApplicationBar from "./features/appBar/ApplicationBar";
import OrderManagement from "./features/orderManagement/OrderManagement";
import OrderProduction from "./features/orderProduction/OrderProduction";
import AppMainMenu from "./features/appMainMenu/AppMainMenu";
import { MessageBoxServiceProvider } from "./features/messageBox/MessageBoxService";
import routeConsts from "./constants/routes";
import Login from "./features/auth/Login";
import ErrorToast from "./features/errors/ErrorToast";
import { thunkApiSubscribeAuthEvents } from "./features/auth/authSlice";
import routes from "./constants/routes";

function App({ isLoggedIn, subscribeApiAuthEvents }) {
  const history = useHistory();

  React.useEffect(() => {
    subscribeApiAuthEvents();
  }, [subscribeApiAuthEvents]);

  React.useEffect(() => {
    if (!isLoggedIn) {
      history.push(`/${routes.login}`);
    }
  }, [isLoggedIn, history]);

  const theme = createMuiTheme({
    palette: {
      type: "light",
    },
  });

  const [showMenuDrawer, setShowMenuDrawer] = React.useState(false);

  return (
    <MessageBoxServiceProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <header id="header">
          <ApplicationBar
            openMenuDrawer={() => {
              setShowMenuDrawer(true);
            }}
          />
        </header>
        <main id="main">
          <nav id="main-menu">
            <AppMainMenu
              showDrawer={showMenuDrawer}
              closeDrawer={() => {
                setShowMenuDrawer(false);
              }}
            />
          </nav>
          <section id="main-content">
            <Switch>
              <Route path={`/${routeConsts.login}`}>
                <Login />
              </Route>
              <Route path={`/${routeConsts.orderManagement}`}>
                <OrderManagement />
              </Route>
              <Route path={`/${routeConsts.orderProduction}`}>
                <OrderProduction />
              </Route>
              <Redirect exact from="/" to={`/${routeConsts.orderManagement}`} />
            </Switch>
          </section>
        </main>
        <footer id="footer"></footer>
        <ErrorToast />
      </ThemeProvider>
    </MessageBoxServiceProvider>
  );
}

const mapStateToProps = (state) => ({
  isLoggedIn: state.auth.loggedIn,
});

const mapDispatchToProps = (dispatch) => ({
  subscribeApiAuthEvents: () => {
    dispatch(thunkApiSubscribeAuthEvents());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
