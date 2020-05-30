import {ensureCallToSelfOrAdmin} from 'app/ensure';
import {NeedsAdminError} from 'app/errors';
import {AbstractStorage} from 'storage/AbstractStorage';
import {Caller} from 'types/Caller';
import {EntityID} from 'types/core_types';
import {UserModel} from 'types/domain_types';
import {PermissionFlags, UserPermissions} from 'types/UserPermissions';

// todo: add email.
export async function createUser(storage: AbstractStorage, caller: Caller, userIDName: string,
                                 userPermissions: UserPermissions, userFullName: string,
                                 telNumber: string): Promise<EntityID> {
  if (!(caller.Permissions.mask & PermissionFlags.Admin)) {
    throw new Error("Not allowed")
  }

  const maybeExisting = await storage.findUserByIdName(userIDName);
  if (maybeExisting) {
    throw new Error("User with such IDName already exists")
  }
  const newUserID = new EntityID('USR');
  storage.insertUser(newUserID, {
    userID : newUserID,
    userIdName : userIDName,
    userFullName : userFullName,
    telNumber : telNumber,
  });
  return newUserID;
}

export async function getAllUsers(storage: AbstractStorage,
                                  caller: Caller): Promise<ReadonlyArray<UserModel>> {
  if (!(caller.Permissions.mask & PermissionFlags.Admin)) {
    throw new Error("Not allowed")
  }
  return storage.getAllUsers();
}

export async function getUser(storage: AbstractStorage, caller: Caller,
                              userID: EntityID): Promise<UserModel> {
  ensureCallToSelfOrAdmin(caller, userID);
  return storage.getUser(userID);
}