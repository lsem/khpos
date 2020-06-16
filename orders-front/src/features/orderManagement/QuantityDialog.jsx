import React from "react";
import {
  TextField,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Box,
} from "@material-ui/core";

export default function QuantityDialog({
  order,
  selectedItem,
  showQuantityDialog,
  handleItemQuantityChange,
  handleQuantityDialogClose,
}) {
  return (
    <Dialog
      open={showQuantityDialog}
      onClose={() => {
        handleQuantityDialogClose(false);
      }}
      aria-labelledby="order-quantity-dialog"
    >
      {order && selectedItem && (
        <React.Fragment>
          <DialogTitle id="order-quantity-dialog">
            {selectedItem.goodName}
          </DialogTitle>
          <DialogContent>
            <Box display="flex" justifyContent="center">
              <TextField
                type="number"
                variant="outlined"
                value={selectedItem.count}
                inputProps={{ min: 0 }}
                onChange={(e) => {
                  handleItemQuantityChange(+e.target.value);
                }}
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleQuantityDialogClose(true);
                  }
                }}
                onFocus={(e) => {
                  e.target.select();
                }}
              />
            </Box>
          </DialogContent>
        </React.Fragment>
      )}

      <DialogActions>
        <Button
          onClick={() => {
            handleQuantityDialogClose(false);
          }}
          color="secondary"
        >
          Ні
        </Button>
        <Button
          onClick={() => {
            handleQuantityDialogClose(true);
          }}
          color="primary"
        >
          Так
        </Button>
      </DialogActions>
    </Dialog>
  );
}
