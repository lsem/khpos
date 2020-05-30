import _ from "lodash";
import {AbstractStorage} from "storage/AbstractStorage";
import {Caller} from "types/Caller";
import {EntityID} from "types/core_types";
import {GoodModel} from "types/domain_types";

import {ensureAdmin} from "./ensure";
import {AlreadyExistsError} from "./errors";

export function getAvailableGoods(storage: AbstractStorage,
                                  caller: Caller): Promise<ReadonlyArray<GoodModel>> {
  return storage.getAllGoods();
}

export async function createGood(storage: AbstractStorage, caller: Caller, name: string,
                                 units: string): Promise<EntityID> {
  ensureAdmin(caller);
  const id = EntityID.makeGoodID();
  const duplicate = _.find(await storage.getAllGoods(), (good: GoodModel) => good.name === name);
  if (!!duplicate) {
    throw new AlreadyExistsError();
  }
  await storage.insertGood(id, {name : name, units : units, id, available : true, removed : false});
  return id;
}

export async function getGoodByID(storage: AbstractStorage, caller: Caller,
                                  id: EntityID): Promise<GoodModel> {
  return storage.getGoodByID(id);
}

export async function makeGoodUnavailable(storage: AbstractStorage, caller: Caller,
                                          id: EntityID): Promise<void> {
  ensureAdmin(caller);
  await storage.updateGood(id, (good) => { return {...good, available : false}; })
}

export async function removeGood(storage: AbstractStorage, caller: Caller,
                                 id: EntityID): Promise<void> {
  ensureAdmin(caller);
  await storage.updateGood(id, (good) => { return {...good, removed : true}; })
}
