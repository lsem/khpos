

import {assert} from "chai";
import {EIDFac} from "types/core_types";
import {PermissionFlags, UserPermissions} from "types/UserPermissions";

import {JWTTokenizationService} from "./tokenization_service";

describe("[tokenization services]", () => {
  it("should be able to perform basic tokenization services", () => {
    const tokenization_service = new JWTTokenizationService();
    const userID = EIDFac.makeUserID();
    const res1ID = EIDFac.makePOSID();
    const res2ID = EIDFac.makePOSID();
    const userPermissions =
        new UserPermissions(PermissionFlags.Admin | PermissionFlags.Read, [ res1ID, res2ID ])
    const token = tokenization_service.makeToken(userID, userPermissions);
    const data = tokenization_service.unpackToken(token);
    assert.equal(data.id, userID);
    assert.equal(data.permissions.mask, PermissionFlags.Admin | PermissionFlags.Read);
  });
});
