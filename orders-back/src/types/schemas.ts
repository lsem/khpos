import * as joi from "joi";

function uuidRegExp(tag: string) {
  return new RegExp(
      `^${tag}-[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`);
}

function TypedUUIDSchema(tag: string) { return joi.string().regex(uuidRegExp(tag)).required(); }

const DateSchema = [ joi.date().iso().required(), joi.date().timestamp().required() ];

export {TypedUUIDSchema, DateSchema};
