import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@material-ui/core";

export default function ConfirmationDialog({
  open,
  title,
  variant,
  description,
  onSubmit,
  onClose,
  onClosed,
}) {
  return (
    <Dialog open={open} onExited={onClosed}>
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        {variant === "prompt" && (
          <>
            <Button color="primary" onClick={onSubmit}>
              ТАК
            </Button>
            <Button color="primary" onClick={onClose} autoFocus>
              НІ
            </Button>
          </>
        )}

        {variant === "info" && (
          <Button color="primary" onClick={onSubmit}>
            Зрозуміло
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
