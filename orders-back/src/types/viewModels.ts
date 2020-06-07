import * as joi from "joi";
import {EID} from "./core_types";
import {TypedUUIDSchema} from "./schemas";

export interface CreatePOSViewModel {
  posIDName: string;
}
export const CreatePOSViewModelSchema = joi.object().keys({posIDName : joi.string().required()});

export interface SinglePOSViewModel {
  posIDName: string;
  posID: EID;
}

export const SinglePOSViewModelSchema =
    joi.object().keys({posIDName : joi.string().required(), posID : TypedUUIDSchema('POS')});

export interface POSCollectionViewModel {
  items: ReadonlyArray<SinglePOSViewModel>;
}
