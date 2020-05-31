import * as joi from "joi";
import {EID} from "types/core_types";
import {GoodModel, POSModel, UserModel} from "types/domain_types";
import * as schemas from "types/schemas";
import {ValidationError} from "./errors";

const nameof = <T>(name: keyof T) => name;

function IDReplacerFor(name: string): (this: any, key: string, val: any) => any {
  return (key, val) => {
    if (key === name) {
      return (val as EID).value;
    }
    return val;
  }
}

function serialize<T>(pos: T, name: keyof T) {
  return JSON.stringify(pos, IDReplacerFor(name.toString()));
}

function deserialize<T>(maybeTJson: string, schema: joi.SchemaLike, name: keyof T): T {
  const validationResult = joi.validate(maybeTJson, schema)
  if (validationResult.error) {
    throw new ValidationError(`Error: ${validationResult.error.message}; actual: ${maybeTJson}`);
  }
  const tJson = JSON.parse(maybeTJson);
  tJson[name] = {value : tJson[name]};
  return tJson as T;
}

export function serializePOS(pos: POSModel): string {
  return serialize(pos, nameof<POSModel>("posID"));
}

export function deserializePOS(maybePOS: string): POSModel {
  return deserialize(maybePOS, schemas.POSSchema, nameof<POSModel>("posID"));
}

export function serializeUser(user: UserModel): string { return ""; }
