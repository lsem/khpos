import {NeedsAdminError} from "app/errors";
import {EntityID} from "./core_types";
import {UserPermissions} from "./UserPermissions";

export class Caller {
  public readonly ID: EntityID;
  public readonly Permissions: UserPermissions;
  constructor(id: EntityID, permissions: UserPermissions) {
    this.ID = id;
    this.Permissions = permissions;
  }

}