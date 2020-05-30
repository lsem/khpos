import {assert, expect} from "chai";
import chai from 'chai';
import chaiAsPromised from "chai-as-promised"
import {InMemoryStorage} from "storage/InMemStorage";
import {Caller} from "types/Caller";
import {EntityID} from "types/core_types";
import {PermissionFlags, UserPermissions} from "types/UserPermissions";

import {AlreadyExistsError, NeedsAdminError, NotFoundError} from "./errors";
import * as goods from "./goods";

const AdminID = EntityID.makeUserID();
const AdminPermissions = new UserPermissions(PermissionFlags.Admin, []);
const AdminAsCaller = new Caller(AdminID, AdminPermissions);

function createUser(permissions: PermissionFlags,
                    resources: EntityID[]): {ID: EntityID, caller: Caller} {
  const id = EntityID.makeUserID();
  return {ID : id, caller : new Caller(id, new UserPermissions(permissions, resources))};
}

describe("[goods]", () => {
  it("Should be possible to create and retrieve goods", async () => {
    const storage = new InMemoryStorage();
    const mokoladID = await goods.createGood(storage, AdminAsCaller, "Моколад", "шт");
    const wineID = await goods.createGood(storage, AdminAsCaller, "Вино", "літри");
    assert.deepEqual(await goods.getAvailableGoods(storage, AdminAsCaller), [
      {id : mokoladID, name : "Моколад", units : "шт", available : true, removed : false},
      {id : wineID, name : "Вино", units : "літри", available : true, removed : false},
    ]);
  });
  // todo: add test that this is good id (and similar tests for others) (rejects non-goods id)
  // todo: add teste for duplicate idname.

  it("Should raise AlreadyExists on attempt to create good with same name", async () => {
    const storage = new InMemoryStorage();
    await goods.createGood(storage, AdminAsCaller, "Моколад", "шт");
    await expect(goods.createGood(storage, AdminAsCaller, "Моколад", "літри"))
        .to.be.rejectedWith(AlreadyExistsError);
  });

  it("Should raise NotFound on attempt to get unexisting good", async () => {
    const storage = new InMemoryStorage();
    await expect(goods.getGoodByID(storage, AdminAsCaller, EntityID.makeGoodID()))
        .to.be.rejectedWith(NotFoundError);
  });

  it("Should not allow creating goods by non-admin user", async () => {
    const storage = new InMemoryStorage();
    const nonAdmin = createUser(PermissionFlags.ReadWrite, []);
    await expect(goods.createGood(storage, nonAdmin.caller, "Моколад", "шт"))
        .to.be.rejectedWith(NeedsAdminError);
  });

  it("Should allow removing goods by admin", async () => {
    const storage = new InMemoryStorage();
    const mokoladID = await goods.createGood(storage, AdminAsCaller, "Моколад", "шт");
    await goods.removeGood(storage, AdminAsCaller, mokoladID);
    assert.containSubset(await goods.getGoodByID(storage, AdminAsCaller, mokoladID),
                         {id : mokoladID, name : "Моколад", removed : true});
  });

  it("Should not allow removing goods by non-admin user", async () => {
    const storage = new InMemoryStorage();
    const mokoladID = await goods.createGood(storage, AdminAsCaller, "Моколад", "шт");
    const nonAdmin = createUser(PermissionFlags.ReadWrite, []);
    await expect(goods.removeGood(storage, nonAdmin.caller, mokoladID))
        .to.be.rejectedWith(NeedsAdminError);
  });

  it("Should be possible to deactivate good (by admin only)", async () => {
    const storage = new InMemoryStorage();
    const mokoladID = await goods.createGood(storage, AdminAsCaller, "Моколад", "шт");
    const charlotteID = await goods.createGood(storage, AdminAsCaller, "Шарлотка", "шт");
    await goods.makeGoodUnavailable(storage, AdminAsCaller, mokoladID);
    assert.containSubset(await goods.getGoodByID(storage, AdminAsCaller, mokoladID),
                         {id : mokoladID, name : "Моколад", available : false});
    assert.containSubset(await goods.getGoodByID(storage, AdminAsCaller, charlotteID),
                         {id : charlotteID, name : "Шарлотка", available : true});
  });

  it("Should not allow deactivating good by non-admin", async () => {
    const storage = new InMemoryStorage();
    const nonAdmin = createUser(PermissionFlags.ReadWrite, []);
    const mokoladID = await goods.createGood(storage, AdminAsCaller, "Моколад", "шт");
    await expect(goods.makeGoodUnavailable(storage, nonAdmin.caller, mokoladID))
        .to.be.rejectedWith(NeedsAdminError);
  });

  it("Should raise NotFound on attmept to deactive unexisting good", async () => {
    const storage = new InMemoryStorage();
    await expect(goods.makeGoodUnavailable(storage, AdminAsCaller, EntityID.makeGoodID()))
        .to.be.rejectedWith(NotFoundError);
  });

  it("Should raise NotFound on attmept to remove unexisting good", async () => {
    const storage = new InMemoryStorage();
    await expect(goods.removeGood(storage, AdminAsCaller, EntityID.makeGoodID()))
        .to.be.rejectedWith(NotFoundError);
  });
});