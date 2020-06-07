import * as joi from "joi";
import _ from "lodash";

function uuidRegExp(tag: string) {
  return new RegExp(
      `^${tag}-[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`);
}

export function TypedUUIDSchema(tag: string) {
  return joi.string().regex(uuidRegExp(tag)).required();
}

export function TypedUUIDSchema2(tags: string[]) {
  const tagsString = "(" + _.join(tags, "|") + ")";
  return joi.string().regex(uuidRegExp(tagsString)).required();
}

export const DateSchema = [ joi.date().iso().required(), joi.date().timestamp().required() ];

export const GoodSchema = joi.object().keys({
  id : TypedUUIDSchema("GOO").required(),
  name : joi.string().required(),
  units : joi.string().required(),
  available : joi.boolean().required(),
  removed : joi.boolean().required()
});

export const POSSchema = joi.object().keys({
  posID : TypedUUIDSchema("POS").required(),
  posIDName : joi.string().required(),
});

