import { createSlice } from "@reduxjs/toolkit";
import moment from "moment";

//temp samples
import orderProduction from "../../samples/orderProduction.json";

export const orderProductionSlice = createSlice({
  name: "orderProduction",
  initialState: {
    aggregated: null,
    errorMessage: null,
  },
  reducers: {
    getAggregatedFromApi: (state) => {
      state.aggregated = null;
    },
    setAggregated: (state, action) => {
      state.aggregated = action.payload;
      state.errorMessage = null;
    },
    setAggregatedError: (state, action) => {
      state.aggregated = null;
      state.errorMessage = action.payload;
    },
  },
});

const {
  getAggregatedFromApi,
  setAggregated,
  setAggregatedError,
} = orderProductionSlice.actions;

//thunks
export const thunkGetAggregatedFromApi = (date) => (dispatch) => {
  dispatch(getAggregatedFromApi());
  new Promise((resolve) => {
    setTimeout(resolve, 1000);
  })
    .then(() => {
      const aggregated = JSON.parse(JSON.stringify(orderProduction));
      aggregated.date = moment().valueOf();

      dispatch(
        setAggregated(aggregated)
      );
    })
    .catch((e) => {
      dispatch(setAggregatedError(`Не вдалося отримати замовлення з сервера: ${e}`));
    });
};

export default orderProductionSlice.reducer;
