import {AlreadyExistsError} from "app/errors";
import _ from "lodash";
import {AbstractStorage} from "storage/AbstractStorage";
import {Caller} from "types/Caller";
import {EID, EIDFac} from "types/core_types";
import {POSModel} from "types/domain_types";
import {PermissionFlags} from "types/UserPermissions";
import {POSCollectionViewModel, SinglePOSViewModel} from "types/viewModels";

export async function createPOS(storage: AbstractStorage, posIDName: string): Promise<EID> {
  // todo: given solution to uniqness suffers from race conditionsm btw.
  const nonUnique = _.find(await storage.getAllPointsOfSale(),
                           (x: POSModel) => { return x.posIDName === posIDName; });
  if (nonUnique) {
    throw new AlreadyExistsError();
  }
  const newPOSID = EIDFac.makePOSID();
  await storage.insertPointOfSale(newPOSID, {
    posIDName : posIDName,
    posID : newPOSID,
  });
  return newPOSID;
}

export async function queryAllPOS(storage: AbstractStorage,
                                  caller: Caller): Promise<POSCollectionViewModel> {
  const allPOS = await getAllPOS(storage, caller);
  return {
    items: _.map(
        allPOS,
        (p: POSModel): SinglePOSViewModel => {return { posID: p.posID, posIDName: p.posIDName }})
  }
}

export async function getAllPOS(storage: AbstractStorage,
                                caller: Caller): Promise<ReadonlyArray<POSModel>> {
  const allPOS = await storage.getAllPointsOfSale();
  if ((caller.Permissions.mask & PermissionFlags.Admin) > 0) {
    return allPOS;
  }
  return _.filter(
      allPOS, (pos) => !!_.find(caller.Permissions.resources, (r) => r == pos.posID));
}

export async function getPOSByID(storage: AbstractStorage, id: EID): Promise<POSModel> {
  return await storage.getPointOfSale(id);
}
