import {Caller} from "types/Caller";
import {EntityID} from "types/core_types";
import {PermissionFlags} from "types/UserPermissions";
import {NeedsAdminError} from "./errors";

function isAdmin(caller: Caller) { return (caller.Permissions.mask & PermissionFlags.Admin) > 0; }

export function ensureCallToSelfOrAdmin(caller: Caller, callTo: EntityID) {
  if (!isAdmin(caller) && !caller.ID.equals(callTo)) {
    throw new NeedsAdminError();
  }
}

export function ensureAdmin(caller: Caller) {
  if (!isAdmin(caller)) {
    throw new NeedsAdminError();
  }
}
