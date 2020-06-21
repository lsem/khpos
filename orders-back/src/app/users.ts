import {ensureAdmin, ensureCallToSelfOrAdmin} from 'app/ensure';
import {assert} from 'joi';
import {AbstractStorage} from 'storage/AbstractStorage';
import {Caller} from 'types/Caller';
import {EID, EIDFac} from 'types/core_types';
import {UserModel, UserRoleSymbolicRepr} from 'types/domain_types';
import {PermissionFlags, UserPermissions} from 'types/UserPermissions';
import {UserLoggedInViewModel, UsersViewModel} from 'types/viewModels';

import {BadArgsError, InvalidCredentialsError, InvalidOperationError} from './errors';
import {BcryptPasswordService, IPasswordService, TestPasswordService} from './password_service';
import {ITokenizationService} from './tokenization_service';

export async function setUserPassword(storage: AbstractStorage, passwordService: IPasswordService,
                                      caller: Caller, userID: EID, password: string) {
  // todo: add password strength validation
  // todo: add tests.
  const passwordHash = await passwordService.hash(password);
  await storage.updateUser(userID,
                           async (user: UserModel) => { user.passwordHash = passwordHash; });
}

export async function loginUser(storage: AbstractStorage, passwordService: IPasswordService,
                                tokenizationService: ITokenizationService, userID: EID,
                                password: string): Promise<UserLoggedInViewModel> {
  const user = await storage.getUser(userID);

  if (!user.isActive) {
    throw new InvalidOperationError("User must be active to log into the system");
  }

  if (!password || !(await passwordService.verify(password, user.passwordHash))) {
    throw new InvalidCredentialsError();
  }

  // todo: invalidate old tokens of this user.

  return {
    role : mapPermissionsToRole(user.permissions),
    token : tokenizationService.makeToken(user.userID, user.permissions)
  };
}

// todo: add email.
export async function createUser(storage: AbstractStorage, passwordService: IPasswordService,
                                 caller: Caller, userIDName: string,
                                 userPermissions: UserPermissions, userPassword: string,
                                 userFullName: string, telNumber: string): Promise<EID> {
  ensureAdmin(caller);

  const maybeExisting = await storage.findUserByIdName(userIDName);
  if (maybeExisting) {
    throw new Error("User with such IDName already exists")
  }

  const newUserID = EIDFac.makeUserID();
  await storage.insertUser(newUserID, {
    userID : newUserID,
    userIdName : userIDName,
    userFullName : userFullName,
    telNumber : telNumber,
    permissions : userPermissions,
    isActive : true,
    passwordHash : await passwordService.hash(userPassword)
  });
  return newUserID;
}

function mapPermissionsToRole(perm: UserPermissions): UserRoleSymbolicRepr {
  if (perm.mask & PermissionFlags.Admin) {
    return 'Admin';
  } else if (perm.mask & PermissionFlags.IsShopManager) {
    return 'ShopManager';
  } else if (perm.mask & PermissionFlags.IsProdStaff) {
    return 'ProdStuff';
  } else {
    throw new BadArgsError(`Unsupported user permissions mask: ${perm.mask}`);
  }
}

// TODO: missing test for this function.
export async function queryUsers(storage: AbstractStorage,
                                 caller: Caller): Promise<UsersViewModel> {
  const userModels = await getAllUsers(storage, caller);
  return {
    items : userModels.map((x: UserModel) => {
      return {
        userID: x.userID, userIdName: x.userIdName, userFullName: x.userFullName,
            telNumber: x.telNumber, useRole: mapPermissionsToRole(x.permissions)
      }
    })
  };
}

export async function getAllUsers(storage: AbstractStorage,
                                  caller: Caller): Promise<ReadonlyArray<UserModel>> {
  ensureAdmin(caller);
  return await storage.getAllUsers();
}

export async function getUser(storage: AbstractStorage, caller: Caller,
                              userID: EID): Promise<UserModel> {
  ensureCallToSelfOrAdmin(caller, userID);
  return await storage.getUser(userID);
}

export async function changesUser(storage: AbstractStorage, caller: Caller, id: EID,
                                  permissions: UserPermissions) {
  ensureAdmin(caller);
  await storage.updateUser(id, (user: UserModel) => { user.permissions = permissions; });
}
