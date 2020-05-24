import { createSlice } from "@reduxjs/toolkit";
import _ from "lodash";

//temp samples
import itemsSample from "../../samples/orderManagement.json";
import sellPointsSample from "../../samples/sellPoints.json";

export const goodsSlice = createSlice({
  name: "orderManagement",
  initialState: {
    order: null,
    sellPoints: null,
    errorMessage: null,
  },
  reducers: {
    setOrder: (state, action) => {
      state.order = action.payload;
      state.errorMessage = null;
    },
    setOrderError: (state, action) => {
      state.order = null;
      state.errorMessage = action.payload;
    },
    setSellPoints: (state, action) => {
      state.sellPoints = action.payload;
      state.errorMessage = null;
    },
    setSellPointsError: (state, action) => {
      state.sellPoints = null;
      state.errorMessage = action.payload;
    },
  },
});

//actions
export const {
  setOrder,
  setOrderError,
  setSellPoints,
  setSellPointsError,
} = goodsSlice.actions;

//thunks
export const getOrderFromApi = (date, sellPointId) => (dispatch) => {
  new Promise((resolve) => {
    setTimeout(resolve, 100);
  })
    .then(() => {
      dispatch(
        setOrder({
          id: "eda20216-9dc8-11ea-bb37-0242ac130002",
          sellPointId,
          date,
          status: "new",
          items: itemsSample,
        })
      );
    })
    .catch(dispatch(setOrderError("Не вдалося отримати товари з сервера")));
};

export const getSellPointsFromApi = () => (dispatch) => {
  new Promise((resolve) => {
    setTimeout(resolve, 5000);
  })
    .then(() => {
      dispatch(setSellPoints(sellPointsSample));
    })
    .catch(() => {
      dispatch(
        setSellPointsError("Не вдалося отримати точки продажу з сервера")
      );
    });
};

export const selectCategories = (state) =>
  state.orderManagement.order
    ? _(state.orderManagement.order.items)
        .uniqBy((g) => g.category)
        .valueOf()
    : [];

export default goodsSlice.reducer;
