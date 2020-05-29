import {AbstractStorage} from 'storage/AbstractStorage';
import {EntityID} from 'types/core_types';
import {UserModel} from 'types/domain_types';
import {Issuer} from 'types/Issuer';
import {PermissionFlags, UserPermissions} from 'types/Permissions';

// todo: add email.
export async function createUser(storage: AbstractStorage, issuer: Issuer, userIDName: string,
                                 userPermissions: UserPermissions, userFullName: string,
                                 telNumber: string): Promise<EntityID> {
  if (!(issuer.Permissions.mask & PermissionFlags.Admin)) {
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
                                  issuer: Issuer): Promise<ReadonlyArray<UserModel>> {
  if (!(issuer.Permissions.mask & PermissionFlags.Admin)) {
    throw new Error("Not allowed")
  }
  return storage.getAllUsers();
}

export async function getUser(storage: AbstractStorage, issuer: Issuer,
                              userID: EntityID): Promise<UserModel> {

  const isAdmin = (issuer.Permissions.mask & PermissionFlags.Admin) > 0;
  if (!isAdmin && (issuer.ID.innerStr !== userID.innerStr)) {
    throw new Error("Not allowed")
  }
  return storage.getUser(userID);
}