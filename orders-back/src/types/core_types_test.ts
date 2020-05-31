import {ValidationError} from "app/errors";
import {assert, expect} from "chai";
import chai from 'chai';
import chaiAsPromised from "chai-as-promised";

import {EID} from "./core_types";

chai.use(chaiAsPromised);

describe("[core_types]", () => {
  it("Entity id should be comparable and different for same entity type", () => {
    const id1 = EID.makeUserID();
    assert.equal(id1, id1);
    const id2 = EID.makePOSID();
    assert.notEqual(id1, id2);
  });

  it("Entity id should not create from non-id/invalid strings", () => {
    assert.throws(() => EID.fromExisting('invalid'), ValidationError,
                  "fails to match the required pattern");
    assert.throws(() => EID.fromExisting(''), ValidationError);
    assert.throws(() => EID.fromExisting('11'), ValidationError);
    assert.throws(() => EID.fromExisting('fac75504-a2a5-11ea-bb37-0242ac130002'), ValidationError);
    assert.throws(() => EID.fromExisting('568BC873-17F9-406A-9BF9-F26CDC6CC505'), ValidationError);
  });

  it("Internal entity id constructors should be valid", () => {
    EID.fromExisting(EID.makeUserID().value);
    EID.fromExisting(EID.makePOSID().value);
    EID.fromExisting(EID.makeGoodID().value);
    EID.fromExisting(EID.makeOrderID().value);
  })
});
