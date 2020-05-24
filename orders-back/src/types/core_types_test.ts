import { assert } from "chai";
import { EntityID } from "./core_types";

describe("[core_types]", () => {
  it("Entity id should be comparable", () => {
    const id1 = new EntityID("XXX");
    assert.equal(id1, id1);
    const id2 = new EntityID("XXX");
    assert.notEqual(id1, id2);
  });
});
