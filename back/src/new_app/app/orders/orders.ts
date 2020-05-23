import * as joi from "joi";
import * as schemas from "../../types/schemas";
import { AbstractStorage } from "../../storage/AbstractStorage";
import { UserIDSchema } from "../users/user_schemas";

// TODO: Move to separate features.
const POSIDSchema = schemas.TypedUUIDSchema("POS");
const ProductIDSchema = schemas.TypedUUIDSchema("PRO");

const OrderItemSchema = joi.object().keys({
  productID: ProductIDSchema,
  count: joi.number().integer(), // todo: find out what is it
});

const OrderModelSchema = joi.object().keys({
  dateCreated: schemas.DateSchema,
  dateOrderFor: schemas.DateSchema,
  placedByUID: UserIDSchema,
  customerPOSID: POSIDSchema,
  items: joi.array().items(OrderItemSchema).required(),
});

// Defines Order which comes from client.

async function placeOrder(storage: AbstractStorage, orderName: string, orderData: any) {
  console.log("placeOrder working..");
  throw new Error("Not implemented");
}

async function getOrdersForDateRange(
  storage: AbstractStorage,
  dateFrom: Date,
  dateTo: Date
) {
  throw new Error("Not implemented");
}

export { placeOrder, getOrdersForDateRange };
