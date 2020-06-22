import React from "react";
import { connect } from "react-redux";

import { resetAuth } from "../auth/authSlice";
import { Redirect } from "react-router-dom";
import routes from "../../constants/routes";

function Logout({ logOut }) {
  React.useEffect(() => {
    logOut();
  }, [logOut]);

  return (<Redirect to={routes.login}/>);
}

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch) => ({
  logOut: () => {
    dispatch(resetAuth());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Logout);
