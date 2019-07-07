import { combineReducers } from "redux";
import { employeesReducer } from "./employees/reducer";
import { techMapsReducer } from "./techMaps/reducer";
import { ingredientsReducer } from "./ingredients/reducer";
import { inventoryReducer } from "./inventory/reducer";
import { planReducer } from "./plan/reducer";


export const rootReducer = combineReducers({
  employees: employeesReducer,
  techMaps: techMapsReducer,
  ingredients: ingredientsReducer,
  inventory: inventoryReducer,
  plan: planReducer
})

export type AppState = ReturnType<typeof rootReducer>