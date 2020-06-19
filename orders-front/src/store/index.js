import { configureStore } from "@reduxjs/toolkit";
import orderManagement from "../features/orderManagement/orderManagementSlice";
import orderProduction from "../features/orderProduction/orderProductionSlice";
import auth from "../features/auth/authSlice";
import pos from "../features/pos/posSlice";
import error from "../features/errors/errorSlice";

export default configureStore({
  reducer: {
    orderManagement,
    orderProduction,
    pos,
    auth,
    error
  },
});
