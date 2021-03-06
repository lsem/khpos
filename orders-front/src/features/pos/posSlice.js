import { createSlice } from "@reduxjs/toolkit";

import api from "../../api";
import { setError } from "../errors/errorSlice";
import extractResponseError from "../../helpers/extractResponseError";

export const posSlice = createSlice({
  name: "pos",
  initialState: {
    items: null,
  },
  reducers: {
    getPosFromApi: (state) => {
      state.items = null;
    },
    setPos: (state, action) => {
      state.items = action.payload.items;
    },
    setPosError: (state, action) => {
      state.items = null;
    },
  },
});

//actions
const { getPosFromApi, setPos } = posSlice.actions;

//thunks
export const thunkGetPosFromApi = () => async (dispatch) => {
  dispatch(getPosFromApi());

  try {
    dispatch(setPos(await api.get("pos").json()));
  } catch (e) {
    dispatch(
      setError(
        await extractResponseError(
          "Не вдалося отримати точки продажу з сервера",
          e
        )
      )
    );
  }
};

export default posSlice.reducer;
