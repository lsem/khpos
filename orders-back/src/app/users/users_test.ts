import {NeedsAdminError} from "app/errors";
import {assert, expect} from "chai";
import chai from 'chai';
import chaiAsPromised from "chai-as-promised"
import _ from 'lodash';
import {InMemoryStorage} from "storage/InMemStorage";
import {Caller} from "types/Caller";
import {EntityID} from "types/core_types";
import {PermissionFlags, UserPermissions} from "types/UserPermissions";

import * as users from "./users";

chai.use(chaiAsPromised);

const AuthorizedCaller =
    new Caller(new EntityID('USR'), new UserPermissions(PermissionFlags.Admin, []));

describe("[users]", () => {
  it("should pass basic test", async () => {
    const storage = new InMemoryStorage();
    const user1Permissions = new UserPermissions(PermissionFlags.Write | PermissionFlags.Write, []);
    const user1ID = await users.createUser(storage, AuthorizedCaller, "Ната", user1Permissions,
                                           "Наталія Бушмак", "+380961112233");
    assert.deepEqual(await users.getUser(storage, AuthorizedCaller, user1ID), {
      userID : user1ID,
      userIdName : "Ната",
      userFullName : "Наталія Бушмак",
      telNumber : "+380961112233",
    });

    assert.deepEqual(await users.getAllUsers(storage, AuthorizedCaller), [ {
                       userID : user1ID,
                       userIdName : "Ната",
                       userFullName : "Наталія Бушмак",
                       telNumber : "+380961112233",
                     } ]);

    const user2Permissions = _.clone(user1Permissions);
    const user2ID = await users.createUser(storage, AuthorizedCaller, "Вас", user2Permissions,
                                           "Василь Тістоміс", "+380961112234");
    assert.deepEqual(await users.getAllUsers(storage, AuthorizedCaller), [
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
    const user1ID = await users.createUser(storage, AuthorizedCaller, "Ната", userPermissions,
                                           "Наталія Бушмак", "+380961112233");
    await expect(users.createUser(storage, AuthorizedCaller, "Ната", userPermissions,
                                  "Наталія Бушмак", "+380961112233"))
        .to.be.rejectedWith(Error, 'User with such IDName already exists');
  });

  it("should disallow creating users by non-authorized user", async () => {
    const storage = new InMemoryStorage();
    const userPermissions = new UserPermissions(PermissionFlags.Write | PermissionFlags.Write, []);

    const NonAuthorizedCaller = new Caller(
        new EntityID('USR'), new UserPermissions(PermissionFlags.Read | PermissionFlags.Write, []));

    await expect(users.createUser(storage, NonAuthorizedCaller, "Ната", userPermissions,
                                  "Наталія Бушмак", "+380961112233"))
        .to.be.rejectedWith(NeedsAdminError, 'NeedsAdminError');

    // Now try creating the same user with by Admin.
    const AdminUser =
        new Caller(new EntityID('USR'), new UserPermissions(PermissionFlags.Admin, []));
    const user1ID = await users.createUser(storage, AdminUser, "Ната", userPermissions,
                                           "Наталія Бушмак", "+380961112233");
  });

  it("should disallow getting users by non-authorized user", async () => {
    const storage = new InMemoryStorage();
    const NonAuthorizedCaller = new Caller(
        new EntityID('USR'), new UserPermissions(PermissionFlags.Read | PermissionFlags.Write, []));
    await expect(users.getAllUsers(storage, NonAuthorizedCaller))
        .to.be.rejectedWith(NeedsAdminError, 'NeedsAdminError')
  });

  it("should allow getting only self", async () => {
    const storage = new InMemoryStorage();
    const ivanPermissions = new UserPermissions(PermissionFlags.Write | PermissionFlags.Write, []);
    const ivanID = await users.createUser(storage, AuthorizedCaller, "ivan", ivanPermissions,
                                          "Ivan Kruasan", "+33999333");
    const ihorPermissions = new UserPermissions(PermissionFlags.Write | PermissionFlags.Write, []);
    const ihorID = await users.createUser(storage, AuthorizedCaller, "ihor", ihorPermissions,
                                          "Ihor Sharlot", "+33999333");

    const ivanAsCaller = new Caller(ivanID, ivanPermissions);

    // Can read self.
    const self = await users.getUser(storage, ivanAsCaller, ivanID);
    // todo: change deepEqual to deepSubset (and for other cases too)
    assert.deepEqual(self, {
      userID : ivanID,
      userIdName : 'ivan',
      userFullName : "Ivan Kruasan",
      telNumber : "+33999333"
    });

    // Cannot read ihor
    await expect(users.getUser(storage, ivanAsCaller, ihorID))
        .to.be.rejectedWith(NeedsAdminError, "NeedsAdminError");

    // Admin can read ihor.
    const adminCaller =
        new Caller(new EntityID('USR'), new UserPermissions(PermissionFlags.Admin, []));

    const ihor = await users.getUser(storage, adminCaller, ihorID);
    assert.deepEqual(ihor, {
      userID : ihorID,
      userIdName : 'ihor',
      userFullName : "Ihor Sharlot",
      telNumber : "+33999333"
    });
  });
});
