import React from "react";
import { connect } from "react-redux";

import { resetAuth } from "../auth/authSlice";

function Logout({ logOut }) {
  React.useEffect(() => {
    logOut();
  }, [logOut]);

  return null;
}

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch) => ({
  logOut: () => {
    dispatch(resetAuth());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Logout);
