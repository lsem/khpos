import React from "react";
import { Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";

import routes from "../../constants/routes";

const ProtectedRoute = (props) => {
  return (
    <Route {...props}>
      {props.loggedIn ? props.children : (<Redirect to={`${routes.login}`} />)}
    </Route>
  );
};

const mapStateToProps = (state) => ({
  loggedIn: state.auth.loggedIn,
});

export default connect(mapStateToProps)(ProtectedRoute);
