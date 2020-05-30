import {AlreadyExistsError} from "app/errors";
import {assert, expect} from "chai";
import chai from 'chai';
import chaiAsPromised from "chai-as-promised"
import {InMemoryStorage} from "storage/InMemStorage";

import * as pos from "./pos";

chai.use(chaiAsPromised);

describe("[point-of-interests]", () => {
  it("should be possible to create point of sales and get listed them", async () => {
    const storage = new InMemoryStorage();
    const pos1ID = await pos.createPOS(storage, "ЧУПРИНКИ1");
    const pos2ID = await pos.createPOS(storage, "ЛЕВИЦЬКОГО1");

    assert.deepEqual(await pos.getAllPOS(storage), [
      {
        posIDName : "ЧУПРИНКИ1",
        posID : pos1ID,
      },
      {
        posIDName : "ЛЕВИЦЬКОГО1",
        posID : pos2ID,
      },
    ]);

    assert.deepEqual(await pos.getPOSByID(storage, pos1ID), {
      posID : pos1ID,
      posIDName : "ЧУПРИНКИ1",
    });
    assert.deepEqual(await pos.getPOSByID(storage, pos2ID), {
      posID : pos2ID,
      posIDName : "ЛЕВИЦЬКОГО1",
    });
  });

  it("Should disallow creating duplicate POSs", async () => {
    const storage = new InMemoryStorage();
    await pos.createPOS(storage, "ЧУПРИНКИ1");
    await expect(pos.createPOS(storage, "ЧУПРИНКИ1")).to.be.rejectedWith(AlreadyExistsError);
  });
});
