import {assert} from "chai";
import {EntityID} from "./core_types";

// TODO: Entire permission systems must fit in one file with goods tests.

// TODO: Describe permissions system.
enum PermissionFlags {
  None = 0x0001,
  Read = 0x0002,
  Write = 0x0004,
  Admin = 0x0008,
  // Dedicated rights for system activities that don't touch users data.
  SystemRead = 0x0010,
  SystemWrite = 0x0020,
  SystemAdmin = 0x0040,
}

// Use cases:
//  Cachier wants to order something for its own primary POS.
//  Cachier wants to order something for another non-primary POS and for its primary POS.
//  ProductionShop wants to see all orders placed for this shop.
//  Owner wants to read or change everything, including changing access rights.
//  Bot wants to read data to produce some useful things.
//  Bot wants to modify something to product some useful things.
//  SuperAdmin with all rights wants to do something fundamental.
//
// In describen scenarios the only place where we want to have fine grained
// control is placing orders which corresponds to Tab management.
// So we can say that permissions for a user is a tuple:
//  <AccessFlags,[ResourcesList]>
// Resourcelist can be empty which would mean that there is no special
// passports or it may have multiple possports which are contectual and correspond
// to ability to make operations with given resource as with its own (not distinguishing between
// reads and writes, although this can be extended by encoding 'rwx' flags to passport itself)

class UserPermissions {
  public readonly mask: PermissionFlags;
  public readonly resources: EntityID[];
  constructor(flags: PermissionFlags, resources: EntityID[]) {
    this.mask = flags;
    this.resources = resources;
  }
};

describe("[permissions]", () => {
  it("usage example", () => {
    const PointOfSale1ID = new EntityID('POS');
    const PointOfSale2ID = new EntityID('POS');

    // This shop manager has rights to read "something" default but cannot create any orders
    // as changing orders requires write permission and write permission in turn requires subject
    // (ID).
    const shopManager1Permission = new UserPermissions(PermissionFlags.Read, []);

    // Next shop manager has generic read access and and has generic write access.
    // Generic read allows it to read what system allows to read with generic read.
    // Generic write allows to read what systems allows to write with generic write.
    // But to write into orders, generic write is not enough and requires explicit subject
    // what can be write (or read).
    const shopManager2Permission =
        new UserPermissions(PermissionFlags.Read | PermissionFlags.Write, [ PointOfSale1ID ])

    // Next can post orders to multiple POS.
    const shopManager3Permission = new UserPermissions(PermissionFlags.Read | PermissionFlags.Write,
                                                       [ PointOfSale1ID, PointOfSale2ID ])

    // TODO: add shortcut for combination R/W/A since A itself is additional flag
    // allowing administer somenthing but it does not give access to reading and wriging some user
    // data. Note, CEO does not have special access control list since it has admin flag
    // which opens all the data to him. So, we can say that having Admin is multipassport/wildcard.
    const CEOPermissions = new UserPermissions(
        PermissionFlags.Read | PermissionFlags.Write | PermissionFlags.Admin, []);

    // We don't differentiate owner from CEO. This decision based on assumption
    // that we basically have people which can be given responsibilities and which not.
    // This holds until we build business processes like placing orders.
    const OwnerPermissions = CEOPermissions;

    // The same, admin is admin.
    const systemMaintananceAdmin = OwnerPermissions;

    // Example of permissions that bot producing analytics should have.
    // He is going to be able to read all orders and other data but in general it may lack
    // capability of reading say, settings.
    const analyticsBOTPermissions = new UserPermissions(PermissionFlags.SystemRead, []);

    // And here is example of script migrating data for us
    const dataMigrationScriptPermissions =
        new UserPermissions(PermissionFlags.SystemRead | PermissionFlags.SystemWrite, []);

    // This user can read write things that related to system admins.
    // In particular this one intended to manage users on behalf of some user who delegates telegram
    // BOT doing some crazy things with another accounts.
    const accessManagerTelegramBOTPermissions = new UserPermissions(
        PermissionFlags.SystemRead | PermissionFlags.SystemWrite | PermissionFlags.SystemAdmin, []);
  });
});