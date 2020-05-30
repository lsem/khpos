import {AlreadyExistsError} from "app/errors";
import {assert, expect} from "chai";
import chai from 'chai';
import chaiAsPromised from "chai-as-promised"
import {InMemoryStorage} from "storage/InMemStorage";
import {Caller} from "types/Caller";
import {EntityID} from "types/core_types";
import {PermissionFlags, UserPermissions} from "types/UserPermissions";

import * as pos from "./pos";

chai.use(chaiAsPromised);

const AdminID = EntityID.makeUserID();
const AdminReadonlyPermissions = new UserPermissions(PermissionFlags.Admin, []);
const AdminUserAsCaller = new Caller(AdminID, AdminReadonlyPermissions);

describe("[point-of-interests]", () => {
  it("should be possible to create point of sales and get listed them", async () => {
    const storage = new InMemoryStorage();
    const pos1ID = await pos.createPOS(storage, "ЧУПРИНКИ1");
    const pos2ID = await pos.createPOS(storage, "ЛЕВИЦЬКОГО1");

    assert.deepEqual(await pos.getAllPOS(storage, AdminUserAsCaller), [
      {
        posIDName : "ЧУПРИНКИ1",
        posID : pos1ID,
      },
      {
        posIDName : "ЛЕВИЦЬКОГО1",
        posID : pos2ID,
      },
    ]);

    assert.deepEqual(await pos.getPOSByID(storage, pos1ID), {
      posID : pos1ID,
      posIDName : "ЧУПРИНКИ1",
    });
    assert.deepEqual(await pos.getPOSByID(storage, pos2ID), {
      posID : pos2ID,
      posIDName : "ЛЕВИЦЬКОГО1",
    });
  });

  it("Should disallow creating duplicate POSs", async () => {
    const storage = new InMemoryStorage();
    await pos.createPOS(storage, "ЧУПРИНКИ1");
    await expect(pos.createPOS(storage, "ЧУПРИНКИ1")).to.be.rejectedWith(AlreadyExistsError);
  });

  it("Should get access only to allowed POS", async () => {
    const storage = new InMemoryStorage();
    const pos1ID = await pos.createPOS(storage, "чупринки");
    const shopManagerID = EntityID.makeUserID();
    const shopManagerReadonlyPermissions = new UserPermissions(PermissionFlags.Read, []);
    const shopManagerUserAsCaller = new Caller(shopManagerID, shopManagerReadonlyPermissions);
    const accessiblePOS = await pos.getAllPOS(storage, shopManagerUserAsCaller);
    assert.isEmpty(accessiblePOS);

    shopManagerReadonlyPermissions.resources.push(pos1ID);
    assert.deepEqual(await pos.getAllPOS(storage, shopManagerUserAsCaller),
                     [ {posID : pos1ID, posIDName : "чупринки"} ]);
  });

  it("Admin allowed to read all POS", async () => {
    const storage = new InMemoryStorage();
    const pos1ID = await pos.createPOS(storage, "чупринки");
    const AdminID = EntityID.makeUserID();
    const AdminReadonlyPermissions = new UserPermissions(PermissionFlags.Admin, []);
    const AdminUserAsCaller = new Caller(AdminID, AdminReadonlyPermissions);
    const accessiblePOS = await pos.getAllPOS(storage, AdminUserAsCaller);
    assert.deepEqual(accessiblePOS, [ {posID : pos1ID, posIDName : "чупринки"} ]);
  });
});
