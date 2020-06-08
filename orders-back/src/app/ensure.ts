import _ from "lodash";
import {Caller} from "types/Caller";
import {EID} from "types/core_types";
import {PermissionFlags} from "types/UserPermissions";

import {NeedsAdminError, NotAllowedError} from "./errors";

export function isAdmin(caller: Caller) {
  return (caller.Permissions.mask & PermissionFlags.Admin) > 0;
}

export function ensureCallToSelfOrAdmin(caller: Caller, callTo: EID) {
  if (!isAdmin(caller) && caller.ID !== callTo) {
    throw new NeedsAdminError();
  }
}

export function ensureAdmin(caller: Caller) {
  if (!isAdmin(caller)) {
    throw new NeedsAdminError();
  }
}

export function callerHasAccessToResource(caller: Caller, resourceID: EID) {
  return _.find(caller.Permissions.resources, _.matches(resourceID))
}

export function ensureHasAccessToPOSOrAdmin(caller: Caller, posID: EID) {
  if (!isAdmin(caller) && !_.find(caller.Permissions.resources, _.matches(posID))) {
    throw new NotAllowedError('access to pos ' + posID);
  }
}
