import { createSlice } from "@reduxjs/toolkit";
import moment from "moment";
import api from "../../api";

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

//thunks
export const thunkApiGetDay = (date, posId) => async (dispatch) => {
  dispatch(apiGetDay());

  try {
    const data = await api
      .get(`dayorder/${posId}?day=${moment(date).format("YYYY-MM-DD")}`)
      .json();

    if (data.status === orderStatuses.NOT_OPENED) {
      dispatch(thunkChangeDayStatus(date, posId, "open"));
    } else {
      dispatch(
        setOrder({
          ...data,
          items: data.items.map((i) => ({
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
  } catch (e) {
    dispatch(
      setOrderError(
        `Не вдалося отримати замовлення з сервера: ${await e.response.text()}`
      )
    );
  }
};

export const thunkChangeDayStatus = (date, posId, status) => async (
  dispatch
) => {
  dispatch(apiChangeDayStatus());

  try {
    await api.post(
      `dayorder/${posId}/${status}?day=${moment(date).format("YYYY-MM-DD")}`
    );
    dispatch(thunkApiGetDay(date, posId));
  } catch (e) {
    dispatch(
      setOrderError(
        `Не вдалося змінити статус замовлення: ${await e.response.text()}`
      )
    );
  }
};

export const thunkApiPatchDay = (date, posId, items) => async (dispatch) => {
  dispatch(apiPatchDay());

  try {
    await api.patch(
      `dayorder/${posId}?day=${moment(date).format("YYYY-MM-DD")}`,
      {
        json: {
          items: items.map((i) => ({ goodID: i.goodID, ordered: i.count })),
        },
      }
    );
    dispatch(thunkApiGetDay(date, posId));
  } catch (e) {
    setOrderError(`Не вдалося зберегти замовлення: ${await e.response.text()}`);
  }
};

export default orderManagementSlice.reducer;
