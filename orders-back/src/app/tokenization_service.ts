import * as jwt from 'jsonwebtoken';
import {EID} from "types/core_types";
import {UserPermissions} from "types/UserPermissions";
import {AuthorizationError} from './errors';

export interface TokenData {
  id: EID;
  permissions: UserPermissions;
}

export interface ITokenizationService {
  makeToken(id: EID, permissions: UserPermissions): string;
  unpackToken(token: string): TokenData;
}

export class JWTTokenizationService implements ITokenizationService {
  makeToken(id: EID, permissions: UserPermissions): string {
    const tokenData: TokenData = {id : id, permissions};
    console.warn('JWTTokenizationService: No secret')
    return jwt.sign(tokenData, 'some super secret thing taken from file', {expiresIn : '15m'});
  }

  unpackToken(token: string): TokenData {
    console.warn('JWTTokenizationService: No secret')
    try {
      const data = jwt.verify(token, 'some super secret thing taken from file')
      return data as TokenData;
    } catch (err) {
      if (err instanceof jwt.JsonWebTokenError) {
        throw new AuthorizationError('Invalid token');
      } else {
        throw err;
      }
    }
  }
}
