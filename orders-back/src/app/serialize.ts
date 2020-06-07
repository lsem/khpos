import * as joi from "joi";
import {EID} from "types/core_types";
import {GoodModel, POSModel, UserModel} from "types/domain_types";
import * as schemas from "types/schemas";
import {ValidationError} from "./errors";

export function serialize<T>(obj: T) { return JSON.stringify(obj); }

// Assuming it is already deserialized by upstream web framework infrastrcuture,
// this method validates and casts object.
export function deserialize<T>(maybeTJson: any, schema: joi.SchemaLike): T {
  const validationResult = joi.validate(maybeTJson, schema)
  if (validationResult.error) {
    throw new ValidationError(`Error: ${validationResult.error.message}; actual: ${maybeTJson}`);
  }
  return maybeTJson as T;
}

export function serializePOS(pos: POSModel): string { return serialize(pos); }
export function deserializePOS(maybePOS: string): POSModel {
  return deserialize(maybePOS, schemas.POSSchema);
}

export function serializeGood(good: GoodModel): string { return serialize(good); }
export function deserializeGood(s: string): GoodModel { return deserialize(s, schemas.GoodSchema); }
