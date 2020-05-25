import {AbstractStorage} from 'storage/AbstractStorage';
import {EntityID} from 'types/core_types';
import {UserModel} from 'types/domain_types';

export async function createUser(storage: AbstractStorage, userIDName: string, userFullName: string,
                                 telNumber: string): Promise<EntityID> {
  const newUserID = new EntityID('USR');
  storage.insertUser(newUserID, {
    userID : newUserID,
    userIdName : userIDName,
    userFullName : userFullName,
    telNumber : telNumber,
  });
  return newUserID;
}

export async function getAllUsers(storage: AbstractStorage): Promise<ReadonlyArray<UserModel>> {
  return storage.getAllUsers();
}

export async function getUser(storage: AbstractStorage, userID: EntityID): Promise<UserModel> {
  return storage.getUser(userID);
}