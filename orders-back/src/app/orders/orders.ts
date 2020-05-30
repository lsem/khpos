import * as joi from "joi";
import {EntityID} from "types/core_types";
import {OrderModel, OrderModelItem} from "types/domain_types";
import {AbstractStorage} from "../../storage/AbstractStorage";
import * as schemas from "../../types/schemas";
import {UserIDSchema} from "../users/user_schemas";

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
  const newOrderID = EntityID.makeOrderID();
  storage.insertOrder(newOrderID, orderData);
  return newOrderID;
}

interface ItemDetails {
  count: number, posIDName: string, posID: EntityID
}

interface Item {
  productName: string;
  productID: EntityID;
  count: number;
  details: ReadonlyArray<ItemDetails>;
}

export interface CombinedOrderView {
  toDate: Date;
  items: ReadonlyArray<Item>;
}

// export async function getOrderForDateAndPOS(storage: AbstractStorage, date: Date) {

// Returns all orders, for all POSs.
// Function designed specifically for case when ProductionShop queries what is to be produced
// for given day.
export async function getOrdersForDate(storage: AbstractStorage,
                                       date: Date): Promise<CombinedOrderView> {
  joi.assert(date, schemas.DateSchema);

  let items: Array<Item> = [];

  let itemContsByGoodID = new Map<EntityID, number>();
  let itemDetailsByGoodID = new Map<EntityID, Array<ItemDetails>>();

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
      productName : (await storage.getProductByID(goodID)).productName,
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
