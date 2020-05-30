import {ValidationError} from "app/errors";
import {assert, expect} from "chai";
import chai from 'chai';
import chaiAsPromised from "chai-as-promised";

import {EntityID} from "./core_types";

chai.use(chaiAsPromised);

describe("[core_types]", () => {
  it("Entity id should be comparable and different for same entity type", () => {
    const id1 = EntityID.makeUserID();
    assert.equal(id1, id1);
    const id2 = EntityID.makePOSID();
    assert.notEqual(id1, id2);
  });

  it("Entity id should not create from non-id/invalid strings", () => {
    assert.throws(() => EntityID.fromExisting('invalid'), ValidationError,
                  "fails to match the required pattern");
    assert.throws(() => EntityID.fromExisting(''), ValidationError);
    assert.throws(() => EntityID.fromExisting('11'), ValidationError);
    assert.throws(() => EntityID.fromExisting('fac75504-a2a5-11ea-bb37-0242ac130002'),
                  ValidationError);
    assert.throws(() => EntityID.fromExisting('568BC873-17F9-406A-9BF9-F26CDC6CC505'),
                  ValidationError);
  });

  it("Internal entity id constructors should be valid", () => {
    EntityID.fromExisting(EntityID.makeUserID().value);
    EntityID.fromExisting(EntityID.makePOSID().value);
    EntityID.fromExisting(EntityID.makeGoodID().value);
    EntityID.fromExisting(EntityID.makeOrderID().value);
  })
});
