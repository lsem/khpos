import { configureStore } from "@reduxjs/toolkit";
import orderManagement from "../features/orderManagement/orderManagementSlice";

export default configureStore({
  reducer: {
    orderManagement: orderManagement,
  },
});
