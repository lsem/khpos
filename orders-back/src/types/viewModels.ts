import * as joi from "joi";

import {EID} from "./core_types";
import {DayStatus} from "./domain_types";
import {TypedUUIDSchema} from "./schemas";

export interface CreatePOSViewModel {
  posIDName: string;
}
export const CreatePOSViewModelSchema = joi.object().keys({posIDName : joi.string().required()});

export interface SinglePOSViewModel {
  posIDName: string;
  posID: EID;
}

export const SinglePOSViewModelSchema = joi.object().keys(
    {posIDName : joi.string().required(), posID : TypedUUIDSchema('POS').required()});

export interface POSCollectionViewModel {
  items: ReadonlyArray<SinglePOSViewModel>;
}

export interface DayViewModel {
  // TODO: do not use daystatus but remap it since on this depends client.
  status: DayStatus;
  items: ReadonlyArray<{goodID : EID; goodName : string; ordered : number; units : string}>
}

export interface ChangeDayViewModel {
  items: ReadonlyArray<{goodID : EID; ordered : number;}>
}

export const ChangeDayViewModelSchema = joi.object().keys({
  items : joi.array()
              .items(joi.object().keys({
                goodID : TypedUUIDSchema('GOO').required(),
                ordered : joi.number().integer().required()
              }))
              .required()
});
