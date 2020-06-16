import React from "react";
import { useHistory } from "react-router-dom";
import moment from "moment";
import { Button, Box } from "@material-ui/core";

import PrintView from "./PrintView";

export default function OrderSummary({
  pos,
  items,
  orderDate,
  handleSaveDayClick,
}) {
  const history = useHistory();

  return (
    <div>
      <PrintView
        items={items}
        orderDate={moment(orderDate).format("DD.MM.YYYY")}
        pos={pos.posIDName}
      />

      <Box
        display="flex"
        justifyContent="center"
        displayPrint="none"
        margin="0 0 30px 0"
      >
        <Button
          onClick={() => {
            history.goBack();
          }}
          color="secondary"
        >
          Назад
        </Button>
        <Button
          onClick={() => {
            handleSaveDayClick();
            history.goBack();
          }}
          color="primary"
        >
          Зберегти
        </Button>
      </Box>
    </div>
  );
}
