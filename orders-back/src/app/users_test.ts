import {NeedsAdminError, NotFoundError} from "app/errors";
import {assert, expect} from "chai";
import chai from 'chai';
import chaiAsPromised from "chai-as-promised";
import chaiSubset from 'chai-subset';
import _ from 'lodash';
import {InMemoryStorage} from "storage/InMemStorage";
import {Caller} from "types/Caller";
import {EID} from "types/core_types";
import {PermissionFlags, UserPermissions} from "types/UserPermissions";

import * as users from "./users";

chai.use(chaiAsPromised);
chai.use(chaiSubset);

const AdminCaller =
    new Caller(EID.makeUserID(), new UserPermissions(PermissionFlags.Admin, []));

describe("[users]", () => {
  it("should pass basic test", async () => {
    const storage = new InMemoryStorage();
    const user1Permissions = new UserPermissions(PermissionFlags.Write | PermissionFlags.Write, []);
    const user1ID = await users.createUser(storage, AdminCaller, "Ната", user1Permissions,
                                           "Наталія Бушмак", "+380961112233");
    assert.containSubset(await users.getUser(storage, AdminCaller, user1ID), {
      userID : user1ID,
      userIdName : "Ната",
      userFullName : "Наталія Бушмак",
      telNumber : "+380961112233",
    });

    assert.containSubset(await users.getAllUsers(storage, AdminCaller), [ {
                           userID : user1ID,
                           userIdName : "Ната",
                           userFullName : "Наталія Бушмак",
                           telNumber : "+380961112233",
                         } ]);

    const user2Permissions = _.clone(user1Permissions);
    const user2ID = await users.createUser(storage, AdminCaller, "Вас", user2Permissions,
                                           "Василь Тістоміс", "+380961112234");
    assert.containSubset(await users.getAllUsers(storage, AdminCaller), [
      {
        userID : user1ID,
        userIdName : "Ната",
        userFullName : "Наталія Бушмак",
        telNumber : "+380961112233",
      },
      {
        userID : user2ID,
        userIdName : "Вас",
        userFullName : "Василь Тістоміс",
        telNumber : "+380961112234",
      }
    ]);
  });

  it("should disallow creating duplicate users", async () => {
    const storage = new InMemoryStorage();
    const userPermissions = new UserPermissions(PermissionFlags.Write | PermissionFlags.Write, []);
    const user1ID = await users.createUser(storage, AdminCaller, "Ната", userPermissions,
                                           "Наталія Бушмак", "+380961112233");
    await expect(users.createUser(storage, AdminCaller, "Ната", userPermissions, "Наталія Бушмак",
                                  "+380961112233"))
        .to.be.rejectedWith(Error, 'User with such IDName already exists');
  });

  it("should disallow creating users by non-authorized user", async () => {
    const storage = new InMemoryStorage();
    const userPermissions = new UserPermissions(PermissionFlags.Write | PermissionFlags.Write, []);

    const NonAuthorizedCaller = new Caller(
        EID.makeUserID(), new UserPermissions(PermissionFlags.Read | PermissionFlags.Write, []));

    await expect(users.createUser(storage, NonAuthorizedCaller, "Ната", userPermissions,
                                  "Наталія Бушмак", "+380961112233"))
        .to.be.rejectedWith(NeedsAdminError, 'NeedsAdminError');

    // Now try creating the same user with by Admin.
    const AdminUser =
        new Caller(EID.makeUserID(), new UserPermissions(PermissionFlags.Admin, []));
    const user1ID = await users.createUser(storage, AdminUser, "Ната", userPermissions,
                                           "Наталія Бушмак", "+380961112233");
  });

  it("should disallow getting users by non-authorized user", async () => {
    const storage = new InMemoryStorage();
    const NonAuthorizedCaller = new Caller(
        EID.makeUserID(), new UserPermissions(PermissionFlags.Read | PermissionFlags.Write, []));
    await expect(users.getAllUsers(storage, NonAuthorizedCaller))
        .to.be.rejectedWith(NeedsAdminError, 'NeedsAdminError')
  });

  it("should allow getting only self", async () => {
    const storage = new InMemoryStorage();
    const ivanPermissions = new UserPermissions(PermissionFlags.Write | PermissionFlags.Write, []);
    const ivanID = await users.createUser(storage, AdminCaller, "ivan", ivanPermissions,
                                          "Ivan Kruasan", "+33999333");
    const ihorPermissions = new UserPermissions(PermissionFlags.Write | PermissionFlags.Write, []);
    const ihorID = await users.createUser(storage, AdminCaller, "ihor", ihorPermissions,
                                          "Ihor Sharlot", "+33999333");

    const ivanAsCaller = new Caller(ivanID, ivanPermissions);

    // Can read self.
    const self = await users.getUser(storage, ivanAsCaller, ivanID);
    assert.containSubset(self, {userID : ivanID, userIdName : 'ivan'});

    // Cannot read ihor
    await expect(users.getUser(storage, ivanAsCaller, ihorID))
        .to.be.rejectedWith(NeedsAdminError, "NeedsAdminError");

    // Admin can read ihor.
    const adminCaller =
        new Caller(EID.makeUserID(), new UserPermissions(PermissionFlags.Admin, []));

    const ihor = await users.getUser(storage, adminCaller, ihorID);
    assert.containSubset(ihor, {userID : ihorID, userIdName : 'ihor'});
  });

  it("should return back proper permissions for user", async () => {
    const storage = new InMemoryStorage();
    const pos1ID = EID.makePOSID();

    const ivanPermissions =
        new UserPermissions(PermissionFlags.Read | PermissionFlags.Write, [ pos1ID ]);

    const ivanID = await users.createUser(storage, AdminCaller, "ivan", ivanPermissions,
                                          "Ivan Kruasan", "+33999333");
    const retrievedUser = await users.getUser(storage, AdminCaller, ivanID);
    assert.containSubset(retrievedUser, {
      permissions : {mask : PermissionFlags.Read | PermissionFlags.Write, resources : [ pos1ID ]}
    })
  });

  it("should allow admins to change permissions", async () => {
    const storage = new InMemoryStorage();
    const pos1ID = EID.makePOSID();

    const ivanPermissions =
        new UserPermissions(PermissionFlags.Read | PermissionFlags.Write, [ pos1ID ]);

    const ivanID = await users.createUser(storage, AdminCaller, "ivan", ivanPermissions,
                                          "Ivan Kruasan", "+33999333");

    const pos2ID = EID.makePOSID();
    const newPermissions =
        new UserPermissions(PermissionFlags.Read | PermissionFlags.Write, [ pos1ID, pos2ID ]);

    await users.changesUser(storage, AdminCaller, ivanID, newPermissions);

    assert.containSubset(await users.getUser(storage, AdminCaller, ivanID), {
      permissions :
          {mask : PermissionFlags.Read | PermissionFlags.Write, resources : [ pos1ID, pos2ID ]}
    });
  });

  it("should disallow to change permissions by self", async () => {
    const storage = new InMemoryStorage();
    const pos1ID = EID.makePOSID();

    const ivanPermissions =
        new UserPermissions(PermissionFlags.Read | PermissionFlags.Write, [ pos1ID ]);

    const ivanID = await users.createUser(storage, AdminCaller, "ivan", ivanPermissions,
                                          "Ivan Kruasan", "+33999333");

    const pos2ID = EID.makePOSID();
    const newPermissions =
        new UserPermissions(PermissionFlags.Read | PermissionFlags.Write, [ pos1ID, pos2ID ]);

    const ivanAsCaller = new Caller(ivanID, ivanPermissions);
    await expect(users.changesUser(storage, ivanAsCaller, ivanID, newPermissions))
        .to.be.rejectedWith(NeedsAdminError, "NeedsAdminError");
  });

  it("should return not found on attept tochange permissions of unexsting user", async () => {
    const storage = new InMemoryStorage();
    const pos1ID = EID.makePOSID();

    const ivanPermissions =
        new UserPermissions(PermissionFlags.Read | PermissionFlags.Write, [ pos1ID ]);

    const ivanID = await users.createUser(storage, AdminCaller, "ivan", ivanPermissions,
                                          "Ivan Kruasan", "+33999333");

    const pos2ID = EID.makePOSID();
    const newPermissions =
        new UserPermissions(PermissionFlags.Read | PermissionFlags.Write, [ pos2ID ]);

    // Netiher admin
    await expect(users.changesUser(storage, AdminCaller, EID.makeUserID(), newPermissions))
        .to.be.rejectedWith(NotFoundError, "NotFoundError");

    // Nor regular user
    const ivanAsCaller = new Caller(ivanID, ivanPermissions);
    await expect(users.changesUser(storage, ivanAsCaller, EID.makeUserID(), newPermissions))
        .to.be.rejectedWith(NeedsAdminError);
  });
});
