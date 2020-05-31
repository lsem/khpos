import {NeedsAdminError} from "app/errors";
import {EID} from "./core_types";
import {UserPermissions} from "./UserPermissions";

export class Caller {
  public readonly ID: EID;
  public readonly Permissions: UserPermissions;
  constructor(id: EID, permissions: UserPermissions) {
    this.ID = id;
    this.Permissions = permissions;
  }

}
