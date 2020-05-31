import { configureStore } from "@reduxjs/toolkit";
import orderManagement from "../features/orderManagement/orderManagementSlice";
import orderProduction from "../features/orderProduction/orderProductionSlice";

export default configureStore({
  reducer: {
    orderManagement,
    orderProduction
  },
});
