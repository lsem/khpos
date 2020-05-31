import * as joi from "joi";
import {EID} from "types/core_types";
import {OrderModel, OrderModelItem} from "types/domain_types";
import {AbstractStorage} from "../storage/AbstractStorage";
import * as schemas from "../types/schemas";
import {UserIDSchema} from "./user_schemas";

// TODO: Move to separate features.
const POSIDSchema = schemas.TypedUUIDSchema("POS");
const ProductIDSchema = schemas.TypedUUIDSchema("PRO");

const OrderItemSchema = joi.object().keys({
  productID : ProductIDSchema,
  count : joi.number().integer(), // todo: find out what is it
});

const OrderModelSchema = joi.object().keys({
  dateCreated : schemas.DateSchema,
  dateOrderFor : schemas.DateSchema,
  placedByUID : UserIDSchema,
  customerPOSID : POSIDSchema,
  items : joi.array().items(OrderItemSchema).required(),
});

export async function placeOrder(storage: AbstractStorage, orderData: OrderModel) {
  const newOrderID = EID.makeOrderID();
  storage.insertOrder(newOrderID, orderData);
  return newOrderID;
}

export interface CombinedOrderView {
  toDate: Date;
  items: ReadonlyArray<{
    productName : string; productID : EID; count : number;
    details : ReadonlyArray<{count : number, posIDName: string, posID: EID}>;
  }>;
}

export async function getOrdersForDate(storage: AbstractStorage,
                                       date: Date): Promise<CombinedOrderView> {
  joi.assert(date, schemas.DateSchema);

  let items: Array<CombinedOrderView['items'][0]> = [];

  let itemContsByGoodID = new Map<EID, number>();
  let itemDetailsByGoodID = new Map<EID, Array<CombinedOrderView['items'][0]['details'][0]>>();

  // Get all orders for all POSs for given date and produce combined POSs.
  const orders = await storage.getOrders(date, date);
  for (const order of orders) {
    for (const item of order.items) {
      if (!itemContsByGoodID.has(item.id)) {
        itemContsByGoodID.set(item.id, 0)
      }
      itemContsByGoodID.set(item.id, itemContsByGoodID.get(item.id)! + item.count);
      if (!itemDetailsByGoodID.has(item.id)) {
        itemDetailsByGoodID.set(item.id, []);
      }
      itemDetailsByGoodID.get(item.id)!.push({
        count : item.count,
        posID : order.posID,
        posIDName : (await storage.getPointOfSale(order.posID)).posIDName
      })
    }
  }

  for (const [goodID, count] of itemContsByGoodID.entries()) {
    items.push({
      productID : goodID,
      productName : (await storage.getGoodByID(goodID)).name,
      count : count,
      details : itemDetailsByGoodID.get(goodID)!
    });
  }

  let result: CombinedOrderView = {
    toDate : date,
    items : items,
  };

  return result;
}
