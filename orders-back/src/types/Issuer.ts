import {EntityID} from "./core_types";
import {UserPermissions} from "./Permissions";

export class Issuer {
  public readonly ID: EntityID;
  public readonly Permissions: UserPermissions;
  constructor(id: EntityID, permissions: UserPermissions) {
    this.ID = id;
    this.Permissions = permissions;
  }
}