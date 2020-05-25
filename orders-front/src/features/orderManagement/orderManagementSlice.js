import { createSlice } from "@reduxjs/toolkit";

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
    getOrderFromApi: (state) => {
      state.order = null;
    },
    setOrder: (state, action) => {
      state.order = action.payload;
      state.errorMessage = null;
    },
    setOrderError: (state, action) => {
      state.order = null;
      state.errorMessage = action.payload;
    },
    getSellPointsFromApi: (state) => {
      state.sellPoints = null;
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
const {
  getOrderFromApi,
  setOrder,
  setOrderError,
  getSellPointsFromApi,
  setSellPoints,
  setSellPointsError,
} = goodsSlice.actions;

//thunks
export const thunkGetOrderFromApi = (date, sellPointId) => (dispatch) => {
  dispatch(getOrderFromApi());
  new Promise((resolve) => {
    setTimeout(resolve, 1000);
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
    .catch(() => {
      dispatch(setOrderError("Не вдалося отримати товари з сервера"));
    });
};

export const thunkGetSellPointsFromApi = () => (dispatch) => {
  dispatch(getSellPointsFromApi());
  new Promise((resolve) => {
    setTimeout(resolve, 1000);
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

export default goodsSlice.reducer;
