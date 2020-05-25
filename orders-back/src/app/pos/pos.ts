import _ from "lodash";
import {AbstractStorage} from "storage/AbstractStorage";
import {EntityID} from "types/core_types";
import {POSModel} from "types/domain_types";

export async function createPOS(storage: AbstractStorage, posIDName: string): Promise<EntityID> {
  // todo: given solution to uniqness suffers from race conditionsm btw.
  const nonUnique = _.find(await storage.getAllPointsOfSale(),
                           (x: POSModel) => { return x.posIDName === posIDName; });
  if (nonUnique) {
    throw new Error("POS IDName is not unique");
  }
  const newPOSID = new EntityID("POS");
  storage.insertPointOfSale(newPOSID, {
    posIDName : posIDName,
    posID : newPOSID,
  });
  return newPOSID;
}

export async function getAllPOS(storage: AbstractStorage): Promise<ReadonlyArray<POSModel>> {
  return storage.getAllPointsOfSale();
}

export async function getPOSByID(storage: AbstractStorage, id: EntityID): Promise<POSModel> {
  return storage.getPointOfSale(id);
}
