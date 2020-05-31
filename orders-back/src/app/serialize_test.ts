import {assert} from "chai";
import {EID} from "types/core_types";
import {POSModel} from "types/domain_types";

import {ValidationError} from "./errors";
import {deserializePOS, serializePOS} from "./serialize";

function expectedJson(s: string) { return JSON.stringify(JSON.parse(s)); }

describe("[serialize", () => {
  it("/POSModel]", () => {
    const sample: POSModel = {
      posID : EID.makeRawPOSID("be684f10-a35d-11ea-bb37-0242ac130002"),
      posIDName : 'чупринки'
    };
    assert.equal(
        serializePOS(sample),
        expectedJson(
            `{"posID":"POS-be684f10-a35d-11ea-bb37-0242ac130002","posIDName":"чупринки"}`));
    const deserializedSample = deserializePOS(
        `{"posID":"POS-be684f10-a35d-11ea-bb37-0242ac130002","posIDName":"чупринки"}`);
    assert.deepEqual(deserializedSample, sample);
    // loopback
    assert.deepEqual(sample, deserializePOS(serializePOS(sample)));
    // missing rejected.
    assert.throws(() => deserializePOS(`{"posID":"POS-be684f10-a35d-11ea-bb37-0242ac130002"}`),
                  ValidationError);
    assert.throws(() => deserializePOS(`{"posIDName":"чупринки"}`), ValidationError);
    // extra rejected.
    assert.throws(
        () => deserializePOS(
            `{"posID":"POS-be684f10-a35d-11ea-bb37-0242ac130002","posIDName":"чупринки", "newField": "newValue"}`),
        ValidationError);
  });
});
