import { createSlice } from "@reduxjs/toolkit";
import moment from "moment";

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

//temp helper
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//thunks
export const thunkGetOrderFromApi = (date, sellPointId) => (dispatch) => {
  dispatch(getOrderFromApi());
  new Promise((resolve) => {
    setTimeout(resolve, 1000);
  })
    .then(() => {
      let items, status;
      if (moment(date).isSame(moment(), "days")) {
        items = JSON.parse(JSON.stringify(itemsSample)).map((item, i) =>
          !(i % 9) ? { ...item, orderedcount: getRandomInt(1, 20) } : item
        );
        status = "processing";
      } else if (moment(date).isBefore(moment(), "days")) {
        items = JSON.parse(JSON.stringify(itemsSample))
          .map((item, i) =>
            !(i % 9)
              ? {
                  ...item,
                  orderedcount: getRandomInt(1, 20),
                  deliveredcount: getRandomInt(1, 20),
                }
              : item
          );
        status = "closed";
      } else {
        items = itemsSample;
        status = "new";
      }

      dispatch(
        setOrder({
          id: "eda20216-9dc8-11ea-bb37-0242ac130002",
          sellPointId,
          date,
          status,
          items,
        })
      );
    })
    .catch((e) => {
      dispatch(setOrderError(`Не вдалося отримати товари з сервера: ${e}`));
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
    .catch((e) => {
      dispatch(
        setSellPointsError(`Не вдалося отримати точки продажу з сервера: ${e}`)
      );
    });
};

export default goodsSlice.reducer;
