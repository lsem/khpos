import {AlreadyExistsError} from "app/errors";
import _ from "lodash";
import {AbstractStorage} from "storage/AbstractStorage";
import {Caller} from "types/Caller";
import {EntityID} from "types/core_types";
import {POSModel} from "types/domain_types";
import {PermissionFlags} from "types/UserPermissions";

export async function createPOS(storage: AbstractStorage, posIDName: string): Promise<EntityID> {
  // todo: given solution to uniqness suffers from race conditionsm btw.
  const nonUnique = _.find(await storage.getAllPointsOfSale(),
                           (x: POSModel) => { return x.posIDName === posIDName; });
  if (nonUnique) {
    throw new AlreadyExistsError();
  }
  const newPOSID = EntityID.makePOSID();
  storage.insertPointOfSale(newPOSID, {
    posIDName : posIDName,
    posID : newPOSID,
  });
  return newPOSID;
}

export async function getAllPOS(storage: AbstractStorage,
                                caller: Caller): Promise<ReadonlyArray<POSModel>> {
  const allPOS = await storage.getAllPointsOfSale();
  if ((caller.Permissions.mask & PermissionFlags.Admin) > 0) {
    return allPOS;
  }
  return _.filter(
      allPOS, (pos) => !!_.find(caller.Permissions.resources, (r) => r.value == pos.posID.value));
}

export async function getPOSByID(storage: AbstractStorage, id: EntityID): Promise<POSModel> {
  return storage.getPointOfSale(id);
}
