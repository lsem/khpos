import * as joi from "joi";
import {EID} from "types/core_types";
import {GoodModel, POSModel, UserModel} from "types/domain_types";
import * as schemas from "types/schemas";
import {ValidationError} from "./errors";

const nameof = <T>(name: keyof T) => name;

function IDReplacerFor<T>(keys: Array<keyof T>): (this: any, key: string, val: any) => any {
  return (key, val) => {
    for (let k of keys) {
      if (key === k.toString()) {
        return (val as EID).value;
      }
    }
    return val;
  }
}

export function serialize<T>(obj: T, idsKeys: Array<keyof T>) {
  return JSON.stringify(obj, IDReplacerFor<T>(idsKeys));
}

export function deserialize<T>(maybeTJson: string, schema: joi.SchemaLike,
                               idsKeys: Array<keyof T>): T {
  const validationResult = joi.validate(maybeTJson, schema)
  if (validationResult.error) {
    throw new ValidationError(`Error: ${validationResult.error.message}; actual: ${maybeTJson}`);
  }
  const tJson = JSON.parse(maybeTJson);
  for (let k of idsKeys) {
    tJson[k] = {value : tJson[k]};
  }
  return tJson as T;
}

export function serializePOS(pos: POSModel): string { return serialize(pos, [ "posID" ]); }
export function deserializePOS(maybePOS: string): POSModel {
  return deserialize(maybePOS, schemas.POSSchema, [ "posID" ]);
}

export function serializeGood(good: GoodModel): string { return serialize(good, [ "id" ]); }
export function deserializeGood(s: string): GoodModel {
  return deserialize(s, schemas.GoodSchema, [ "id" ]);
}
