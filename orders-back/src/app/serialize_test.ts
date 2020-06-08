import {assert} from "chai";
import * as joi from 'joi';
import {EID, EIDFac} from "types/core_types";
import {GoodModel, POSModel} from "types/domain_types";

import {ValidationError} from "./errors";
import {deserializeGood, deserializePOS, serialize, serializeGood, serializePOS} from "./serialize";

function expectedJson(s: string) { return JSON.stringify(JSON.parse(s)); }

interface Example {
  id1: EID;
  s: string;
  b: boolean;
  id2: EID
}

describe("[serialize", () => {
  it("/generic serialize]", () => {
    const example: Example = {
      id1 : EIDFac.makeRawPOSID("be684f10-a35d-11ea-bb37-0242ac130002"),
      s : 'I am example',
      b : true,
      id2 : EIDFac.makeRawGoodID("be684f10-a35d-11ea-bb37-0242ac130002")
    };
    const serialzied = serialize<Example>(example, [ 'id1', 'id2' ]);
    const expectedSerializedExample =
        `{"id1":"POS-be684f10-a35d-11ea-bb37-0242ac130002","s":"I am example","b":true,"id2":"GOO-be684f10-a35d-11ea-bb37-0242ac130002"}`;
    assert.deepEqual(serialzied, expectedJson(expectedSerializedExample));
  });

  it("/POSModel]", () => {
    const sample: POSModel = {
      posID : EIDFac.makeRawPOSID("be684f10-a35d-11ea-bb37-0242ac130002"),
      posIDName : 'чупринки'
    };
    const serializedSample =
        `{"posID":"POS-be684f10-a35d-11ea-bb37-0242ac130002","posIDName":"чупринки"}`;
    assert.equal(serializePOS(sample), expectedJson(serializedSample));
    const deserializedSample = deserializePOS(serializedSample);
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

  it("/GoodModel]", () => {
    const sample: GoodModel = {
      id : EIDFac.makeRawGoodID("be684f10-a35d-11ea-bb37-0242ac130002"),
      name : 'Шарлотка',
      units : 'шт',
      available : true,
      removed : false
    };
    const serializedSample =
        `{"id":"GOO-be684f10-a35d-11ea-bb37-0242ac130002","name":"Шарлотка","units":"шт","available":true,"removed":false}`;
    assert.deepEqual(serializedSample, serializeGood(sample));
    // loopback
    assert.deepEqual(deserializeGood(serializeGood(sample)), sample);
  });
});
