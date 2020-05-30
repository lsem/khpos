import {Caller} from "types/Caller";
import {EntityID} from "types/core_types";
import {PermissionFlags} from "types/UserPermissions";
import {NeedsAdminError} from "./errors";

export function ensureCallToSelfOrAdmin(caller: Caller, callTo: EntityID) {
  const selfAdmin = (caller.Permissions.mask & PermissionFlags.Admin) > 0;
  if (!selfAdmin && !caller.ID.equals(callTo)) {
    throw new NeedsAdminError();
  }
}
