import {EntityID} from "./core_types";

export enum PermissionFlags {
  None = 0x0000,
  Read = 0x0001,
  Write = 0x0002,
  Admin = 0x0004,
  // Dedicated rights for system activities that don't touch users data.
  SystemRead = 0x0008,
  SystemWrite = 0x0010,
  SystemAdmin = 0x0020,

  ReadWrite = Read | Write,
}

export class UserPermissions {
  public readonly mask: PermissionFlags;
  public readonly resources: EntityID[];
  constructor(flags: PermissionFlags, resources: EntityID[]) {
    this.mask = flags;
    this.resources = resources;
  }
};
