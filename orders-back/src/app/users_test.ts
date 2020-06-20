import {InvalidCredentialsError, NeedsAdminError, NotFoundError} from "app/errors";
import {assert, expect} from "chai";
import chai from 'chai';
import chaiAsPromised from "chai-as-promised";
import chaiSubset from 'chai-subset';
import _ from 'lodash';
import {AbstractStorage} from "storage/AbstractStorage";
import {InMemoryStorage} from "storage/InMemStorage";
import {Caller} from "types/Caller";
import {EID, EIDFac} from "types/core_types";
import {PermissionFlags, UserPermissions} from "types/UserPermissions";

import {BcryptPasswordService, TestPasswordService} from "./password_service";
import {JWTTokenizationService} from "./tokenization_service";
import * as users from "./users";

chai.use(chaiAsPromised);
chai.use(chaiSubset);

const AdminCaller = new Caller(EIDFac.makeUserID(), new UserPermissions(PermissionFlags.Admin, []));

async function createUser_nopass(storage: AbstractStorage, caller: Caller, userIDName: string,
                                 userPermissions: UserPermissions, userFullName: string,
                                 telNumber: string): Promise<EID> {
  return await users.createUser(storage, new TestPasswordService(), caller, userIDName,
                                userPermissions, '', userFullName, telNumber);
}

describe("[users]", () => {
  it("should pass basic test", async () => {
    const storage = new InMemoryStorage();
    const user1Permissions = new UserPermissions(PermissionFlags.Write | PermissionFlags.Write, []);
    const user1ID = await createUser_nopass(storage, AdminCaller, "Ната", user1Permissions,
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
    const user2ID = await createUser_nopass(storage, AdminCaller, "Вас", user2Permissions,
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
    const user1ID = await createUser_nopass(storage, AdminCaller, "Ната", userPermissions,
                                            "Наталія Бушмак", "+380961112233");
    await expect(createUser_nopass(storage, AdminCaller, "Ната", userPermissions, "Наталія Бушмак",
                                   "+380961112233"))
        .to.be.rejectedWith(Error, 'User with such IDName already exists');
  });

  it("should disallow creating users by non-authorized user", async () => {
    const storage = new InMemoryStorage();
    const userPermissions = new UserPermissions(PermissionFlags.Write | PermissionFlags.Write, []);

    const NonAuthorizedCaller = new Caller(
        EIDFac.makeUserID(), new UserPermissions(PermissionFlags.Read | PermissionFlags.Write, []));

    await expect(createUser_nopass(storage, NonAuthorizedCaller, "Ната", userPermissions,
                                   "Наталія Бушмак", "+380961112233"))
        .to.be.rejectedWith(NeedsAdminError, 'NeedsAdminError');

    // Now try creating the same user with by Admin.
    const AdminUser =
        new Caller(EIDFac.makeUserID(), new UserPermissions(PermissionFlags.Admin, []));
    const user1ID = await createUser_nopass(storage, AdminUser, "Ната", userPermissions,
                                            "Наталія Бушмак", "+380961112233");
  });

  it("should disallow getting users by non-authorized user", async () => {
    const storage = new InMemoryStorage();
    const NonAuthorizedCaller = new Caller(
        EIDFac.makeUserID(), new UserPermissions(PermissionFlags.Read | PermissionFlags.Write, []));
    await expect(users.getAllUsers(storage, NonAuthorizedCaller))
        .to.be.rejectedWith(NeedsAdminError, 'NeedsAdminError')
  });

  it("should allow getting only self", async () => {
    const storage = new InMemoryStorage();
    const ivanPermissions = new UserPermissions(PermissionFlags.Write | PermissionFlags.Write, []);
    const ivanID = await createUser_nopass(storage, AdminCaller, "ivan", ivanPermissions,
                                           "Ivan Kruasan", "+33999333");
    const ihorPermissions = new UserPermissions(PermissionFlags.Write | PermissionFlags.Write, []);
    const ihorID = await createUser_nopass(storage, AdminCaller, "ihor", ihorPermissions,
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
        new Caller(EIDFac.makeUserID(), new UserPermissions(PermissionFlags.Admin, []));

    const ihor = await users.getUser(storage, adminCaller, ihorID);
    assert.containSubset(ihor, {userID : ihorID, userIdName : 'ihor'});
  });

  it("should return back proper permissions for user", async () => {
    const storage = new InMemoryStorage();
    const pos1ID = EIDFac.makePOSID();

    const ivanPermissions =
        new UserPermissions(PermissionFlags.Read | PermissionFlags.Write, [ pos1ID ]);

    const ivanID = await createUser_nopass(storage, AdminCaller, "ivan", ivanPermissions,
                                           "Ivan Kruasan", "+33999333");
    const retrievedUser = await users.getUser(storage, AdminCaller, ivanID);
    assert.containSubset(retrievedUser, {
      permissions : {mask : PermissionFlags.Read | PermissionFlags.Write, resources : [ pos1ID ]}
    })
  });

  it("should allow admins to change permissions", async () => {
    const storage = new InMemoryStorage();
    const pos1ID = EIDFac.makePOSID();

    const ivanPermissions =
        new UserPermissions(PermissionFlags.Read | PermissionFlags.Write, [ pos1ID ]);

    const ivanID = await createUser_nopass(storage, AdminCaller, "ivan", ivanPermissions,
                                           "Ivan Kruasan", "+33999333");

    const pos2ID = EIDFac.makePOSID();
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
    const pos1ID = EIDFac.makePOSID();

    const ivanPermissions =
        new UserPermissions(PermissionFlags.Read | PermissionFlags.Write, [ pos1ID ]);

    const ivanID = await createUser_nopass(storage, AdminCaller, "ivan", ivanPermissions,
                                           "Ivan Kruasan", "+33999333");

    const pos2ID = EIDFac.makePOSID();
    const newPermissions =
        new UserPermissions(PermissionFlags.Read | PermissionFlags.Write, [ pos1ID, pos2ID ]);

    const ivanAsCaller = new Caller(ivanID, ivanPermissions);
    await expect(users.changesUser(storage, ivanAsCaller, ivanID, newPermissions))
        .to.be.rejectedWith(NeedsAdminError, "NeedsAdminError");
  });

  it("should return not found on attept tochange permissions of unexsting user", async () => {
    const storage = new InMemoryStorage();
    const pos1ID = EIDFac.makePOSID();

    const ivanPermissions =
        new UserPermissions(PermissionFlags.Read | PermissionFlags.Write, [ pos1ID ]);

    const ivanID = await createUser_nopass(storage, AdminCaller, "ivan", ivanPermissions,
                                           "Ivan Kruasan", "+33999333");

    const pos2ID = EIDFac.makePOSID();
    const newPermissions =
        new UserPermissions(PermissionFlags.Read | PermissionFlags.Write, [ pos2ID ]);

    // Netiher admin
    await expect(users.changesUser(storage, AdminCaller, EIDFac.makeUserID(), newPermissions))
        .to.be.rejectedWith(NotFoundError, "NotFoundError");

    // Nor regular user
    const ivanAsCaller = new Caller(ivanID, ivanPermissions);
    await expect(users.changesUser(storage, ivanAsCaller, EIDFac.makeUserID(), newPermissions))
        .to.be.rejectedWith(NeedsAdminError);
  });

  it("should allow logging in with correct password", async () => {
    const storage = new InMemoryStorage();
    const passwordService = new TestPasswordService();
    const tokenizationService = new JWTTokenizationService();
    const ivanID = await users.createUser(storage, passwordService, AdminCaller, 'ivan',
                                          new UserPermissions(PermissionFlags.IsShopManager, []),
                                          "secret pass", "Ivan Motyka", "123 tel");

    // Unknown user tests

    await expect(users.loginUser(storage, passwordService, tokenizationService, EIDFac.makeUserID(),
                                 "secret pass"))
        .to.be.rejectedWith(NotFoundError, "User");

    const token =
        await users.loginUser(storage, passwordService, tokenizationService, ivanID, "secret pass");

    // Negative tests
    await expect(users.loginUser(storage, passwordService, tokenizationService, ivanID, ""))
        .to.be.rejectedWith(InvalidCredentialsError);
    const x: any = undefined;
    await expect(users.loginUser(storage, passwordService, tokenizationService, ivanID, x))
        .to.be.rejectedWith(InvalidCredentialsError);
    const y: any = null;
    await expect(users.loginUser(storage, passwordService, tokenizationService, ivanID, y))
        .to.be.rejectedWith(InvalidCredentialsError);
    await expect(
        users.loginUser(storage, passwordService, tokenizationService, ivanID, "secret pass1"))
        .to.be.rejectedWith(InvalidCredentialsError);
  });

  // todo: redesign api to make it testable. now implementation used bcrypt.
  it.skip("newly created users has no hash and after settings hash, hash is available",
          async () => {
            const storage = new InMemoryStorage();
            const ivanID =
                await users.createUser(storage, new TestPasswordService(), AdminCaller, 'ivan',
                                       new UserPermissions(PermissionFlags.IsShopManager, []),
                                       "secret", "Ivan Motyka", "123");
            assert.equal((await users.getUser(storage, AdminCaller, ivanID)).isActive, true);
            await users.setUserPassword(storage, new TestPasswordService(), AdminCaller, ivanID,
                                        "secret secret");
            assert.equal((await users.getUser(storage, AdminCaller, ivanID)).isActive, true);
            assert.equal((await users.getUser(storage, AdminCaller, ivanID)).passwordHash,
                         'encrypted<secret secret>');
          });
});
