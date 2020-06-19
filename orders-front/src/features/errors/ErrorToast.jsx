import React from "react";
import { Typography, Snackbar, SnackbarContent } from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import { connect } from 'react-redux';
import { resetError } from "../errors/errorSlice";

function ErrorToast({
  message,
  resetError
}) {
  const theme = useTheme();

  return (
    <Snackbar
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      open={!!message}
      onClose={resetError}
    >
      <SnackbarContent
        style={{
          backgroundColor: theme.palette.error.main,
          textAlign: "center",
        }}
        message={<Typography id="client-snackbar">{message}</Typography>}
      />
    </Snackbar>
  );
}

const mapStateToProps = (state) => ({
  message: state.error.message,
});

const mapDispatchToProps = (dispatch) => ({
  resetError: () => {
    dispatch(resetError());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ErrorToast);
