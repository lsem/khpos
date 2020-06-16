import React from "react";
import { Typography, Snackbar, SnackbarContent } from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";

export default function ErrorToast({
  error,
  showErrorToast,
  setShowErrorToast,
}) {
  const theme = useTheme();

  return (
    <Snackbar
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      open={showErrorToast}
      onClose={() => {
        setShowErrorToast(false);
      }}
    >
      <SnackbarContent
        style={{
          backgroundColor: theme.palette.error.main,
          textAlign: "center",
        }}
        message={<Typography id="client-snackbar">{error}</Typography>}
      />
    </Snackbar>
  );
}
