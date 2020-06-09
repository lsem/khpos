import { configureStore } from "@reduxjs/toolkit";
import orderManagement from "../features/orderManagement/orderManagementSlice";
import orderProduction from "../features/orderProduction/orderProductionSlice";
import pos from "../features/pos/posSlice";

export default configureStore({
  reducer: {
    orderManagement,
    orderProduction,
    pos,
  },
});
