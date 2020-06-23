import { createSlice } from "@reduxjs/toolkit";
import moment from "moment";
import api from "../../api";

import orderStatuses from "../../constants/orderStatuses";
import { setError } from "../errors/errorSlice";
import extractResponseError from "../../helpers/extractResponseError";

export const orderManagementSlice = createSlice({
  name: "orderManagement",
  initialState: {
    order: null,
  },
  reducers: {
    apiGetDay: () => {},
    apiChangeDayStatus: () => {},
    apiPatchDay: () => {},
    setOrder: (state, action) => {
      state.order = action.payload;
    },
  },
});

//actions
const {
  apiGetDay,
  apiChangeDayStatus,
  apiPatchDay,
  setOrder,
} = orderManagementSlice.actions;

//thunks
export const thunkApiGetDayByPos = (date, posId) => async (dispatch) => {
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
      setError(
        await extractResponseError(
          "Не вдалося отримати замовлення з сервера",
          e
        )
      )
    );
  }
};

export const thunkApiGetDayAllPos = (date) => async (dispatch) => {
  dispatch(apiGetDay());

  try {
    const data = await api
      .get(`total?day=${moment(date).format("YYYY-MM-DD")}`)
      .json();

    dispatch(
      setOrder({
        ...data,
        items: data.items.map((i) => ({
          ...i,
          category: "fake",
          count: i.ordered,
        })),
        avaliableActions: [],
      })
    );
  } catch (e) {
    dispatch(
      setError(
        await extractResponseError(
          "Не вдалося отримати замовлення з сервера",
          e
        )
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
    dispatch(thunkApiGetDayByPos(date, posId));
  } catch (e) {
    dispatch(
      setError(
        await extractResponseError("Не вдалося змінити статус замовлення", e)
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
    dispatch(thunkApiGetDayByPos(date, posId));
  } catch (e) {
    dispatch(await extractResponseError("Не вдалося зберегти замовлення", e));
  }
};

export default orderManagementSlice.reducer;
