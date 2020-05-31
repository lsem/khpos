import * as joi from "joi";
import {EntityID} from "types/core_types";
import {GoodModel, POSModel, UserModel} from "types/domain_types";
import * as schemas from "types/schemas";
import {ValidationError} from "./errors";

const nameof = <T>(name: keyof T) => name;

function IDReplacerFor(name: string): (this: any, key: string, val: any) => any {
  return (key, val) => {
    if (key === name) {
      return (val as EntityID).value;
    }
    return val;
  }
}

export function serializePOS(pos: POSModel): string {
  return JSON.stringify(pos, IDReplacerFor(nameof<POSModel>("posID")));
}

export function deserializePOS(maybePOS: string): POSModel {
  const validationResult = joi.validate(maybePOS, schemas.POSSchema)
  if (validationResult.error) {
    throw new ValidationError(`Error: ${validationResult.error.message}; actual: ${maybePOS}`);
  }
  const parsed = JSON.parse(maybePOS);
  parsed.posID = {value : parsed.posID};
  return parsed as POSModel;
}

export function serializeUser(user: UserModel): string { return ""; }