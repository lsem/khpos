import { assert } from "chai";
import * as pos from "./pos";
import { InMemoryStorage } from "storage/InMemStorage";

describe("[point-of-interests]", () => {
  it("should be possible to create point of sales and get listed them", async () => {
    const storage = new InMemoryStorage();
    const pos1ID = await pos.createPOS(storage, "ЧУПРИНКИ1");
    const pos2ID = await pos.createPOS(storage, "ЛЕВИЦЬКОГО1");

    assert.deepEqual(await pos.getAllPOS(storage), [
      {
        posIDName: "ЧУПРИНКИ1",
        posID: pos1ID,
      },
      {
        posIDName: "ЛЕВИЦЬКОГО1",
        posID: pos2ID,
      },
    ]);

    assert.deepEqual(await pos.getPOSByID(storage, pos1ID), {
      posID: pos1ID,
      posIDName: "ЧУПРИНКИ1",
    });
    assert.deepEqual(await pos.getPOSByID(storage, pos2ID), {
      posID: pos2ID,
      posIDName: "ЛЕВИЦЬКОГО1",
    });
  });

  it("Should disallow creating duplicate POSs", async () => {
    const storage = new InMemoryStorage();
    // todo: For some reason chai-as-promised does not work for me here, find out why.
    // See https://www.npmjs.com/package/chai-as-promised
    // assert.isFulfilled(pos.createPOS(storage, "ЧУПРИНКИ1"));
    // assert.isRejected(pos.createPOS(storage, "ЧУПРИНКИ1"), Error, "Haha");
    let firstPassed = false;
    try {
      await pos.createPOS(storage, "ЧУПРИНКИ1");
      firstPassed = true;
      await pos.createPOS(storage, "ЧУПРИНКИ1");
    } catch (err) {
      assert.instanceOf(err, Error);
      assert.equal(err.message, "POS IDName is not unique");
      assert.isTrue(firstPassed);
    }
  });
});
