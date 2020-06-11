import { createSlice } from "@reduxjs/toolkit";
import moment from "moment";
import axios from "axios";

import orderStatuses from "../../constants/orderStatuses";

export const orderManagementSlice = createSlice({
  name: "orderManagement",
  initialState: {
    order: null,
    errorMessage: null,
  },
  reducers: {
    apiGetDay: (state) => {
      state.errorMessage = null;
    },
    apiChangeDayStatus: (state) => {
      state.errorMessage = null;
    },
    apiPatchDay: (state) => {
      state.errorMessage = null;
    },
    setOrder: (state, action) => {
      state.order = action.payload;
      state.errorMessage = null;
    },
    setOrderError: (state, action) => {
      state.errorMessage = action.payload;
    },
  },
});

//actions
const {
  apiGetDay,
  apiChangeDayStatus,
  apiPatchDay,
  setOrder,
  setOrderError,
} = orderManagementSlice.actions;

//helpers
const extractError = (e) => {
  return e.response.data || e;
};

//thunks
export const thunkApiGetDay = (date, posId) => (dispatch) => {
  dispatch(apiGetDay());

  axios
    .get(`/dayorder/${posId}?day=${moment(date).format("YYYY-MM-DD")}`)
    .then((response) => {
      if (response.data.status === orderStatuses.NOT_OPENED) {
        dispatch(thunkChangeDayStatus(date, posId, "open"));
      } else {
        dispatch(
          setOrder({
            ...response.data,
            items: response.data.items.map((i) => ({
              ...i,
              category: "fake",
              count: i.ordered,
            })),
            avaliableActions: [
              { id: "open", name: "Відкрите" },
              { id: "close", name: "Закрите" },
              { id: "finalize", name: "Прийняте" },
            ],
          })
        );
      }
    })
    .catch((e) => {
      dispatch(
        setOrderError(
          `Не вдалося отримати замовлення з сервера: ${extractError(e)}`
        )
      );
    });
};

export const thunkChangeDayStatus = (date, posId, status) => (dispatch) => {
  dispatch(apiChangeDayStatus());

  axios
    .post(
      `/dayorder/${posId}/${status}?day=${moment(date).format("YYYY-MM-DD")}`
    )
    .then(() => {
      dispatch(thunkApiGetDay(date, posId));
    })
    .catch((e) => {
      dispatch(
        setOrderError(
          `Не вдалося змінити статус замовлення: ${extractError(e)}`
        )
      );
    });
};

export const thunkApiPatchDay = (date, posId, items) => (dispatch) => {
  dispatch(apiPatchDay());

  axios
    .patch(`/dayorder/${posId}?day=${moment(date).format("YYYY-MM-DD")}`, {
      items: items.map((i) => ({ goodID: i.goodID, ordered: i.count })),
    })
    .then(() => {
      dispatch(thunkApiGetDay(date, posId));
    })
    .catch((e) => {
      dispatch(
        setOrderError(`Не вдалося зберегти замовлення: ${extractError(e)}`)
      );
    });
};

export default orderManagementSlice.reducer;
