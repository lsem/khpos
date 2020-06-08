import {ValidationError} from "app/errors";
import {assert, expect} from "chai";
import chai from 'chai';
import chaiAsPromised from "chai-as-promised";

import {Day, EID, EIDFac} from "./core_types";

chai.use(chaiAsPromised);

describe("[core_types]", () => {
  it("Entity id should be comparable and different for same entity type", () => {
    const id1 = EIDFac.makeUserID();
    assert.equal(id1, id1);
    const id2 = EIDFac.makePOSID();
    assert.notEqual(id1, id2);
  });

  it("Entity id should not create from non-id/invalid strings", () => {
    assert.throws(() => EIDFac.fromExisting('invalid'), ValidationError,
                  "fails to match the required pattern");
    assert.throws(() => EIDFac.fromExisting(''), ValidationError);
    assert.throws(() => EIDFac.fromExisting('11'), ValidationError);
    assert.throws(() => EIDFac.fromExisting('fac75504-a2a5-11ea-bb37-0242ac130002'), ValidationError);
    assert.throws(() => EIDFac.fromExisting('568BC873-17F9-406A-9BF9-F26CDC6CC505'), ValidationError);
  });

  it("Internal entity id constructors should be valid", () => {
    EIDFac.fromExisting(EIDFac.makeUserID());
    EIDFac.fromExisting(EIDFac.makePOSID());
    EIDFac.fromExisting(EIDFac.makeGoodID());
    EIDFac.fromExisting(EIDFac.makeOrderID());
  })

  it("Should construct days from date properly", () => {
    assert.equal(Day.fromDate(new Date("1970-01-01")).val, 0);
    assert.equal(Day.fromDate(new Date("1970-01-02")).val, 1);
    assert.equal(Day.fromDate(new Date("1971-01-01")).val, 365);
    assert.equal(Day.fromDate(new Date("2020-01-01")).val, 18262);
  });
});
