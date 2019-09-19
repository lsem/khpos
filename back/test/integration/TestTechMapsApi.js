process.env.NODE_ENV = "test";

const KhPosNodeTestApp = require("../../KhPosNodeTestApp");
const chai = require("chai");
var expect = require("chai").expect;
var assert = require("chai").assert;
var should = require("chai").should;
const moment = require("moment");
const uuid = require("uuid");
const chaiHttp = require("chai-http");
var chaiSubset = require("chai-subset");
const _ = require("lodash");

chai.use(chaiHttp);
chai.use(chaiSubset);

function newItemId(prefix) {
  return `${prefix}-${uuid.v4()}`;
}

describe("API", () => {
  let app;

  before(async () => {
    app = await KhPosNodeTestApp.create();
    await app.start();
  });

  after(async () => {
    await app.stop();
  });

  beforeEach(async () => {
    await app.getApp().clearStorage();
  });

  describe("/techmaps", () => {
    it("should provide application/json content type header", done => {
      chai
        .request(app.server())
        .get("/techmaps")
        .end((err, res) => {
          expect(res).to.have.header("content-type", "application/json; charset=utf-8");
          done();
        });
    });

    it("should be CORS enabled", async () => {
      // TODO: https://github.com/lsem/khpos/issues/10
      const checkExpectations = res => {
        expect(res).to.have.header("Access-Control-Allow-Origin", "*");
        expect(res).to.have.header("Access-Control-Allow-Methods", undefined);
        expect(res).to.have.header("Access-Control-Allow-Headers", undefined);
      };
      checkExpectations(await chai.request(app.server()).get("/techmaps"));
      checkExpectations(await chai.request(app.server()).post("/techmaps"));
      checkExpectations(await chai.request(app.server()).patch("/techmaps"));
    });

    it("should return 404 if unexisting techMap is requested", async () => {
      const res = await chai.request(app.server()).get(`/techmaps/${newItemId("TM")}`);
      expect(res).to.have.status(404);
    });

    it("should bump up version when modified techmap put", async () => {
      const id = newItemId("TM");

      const newTechMap = {
        id,
        name: "Хліб Французький (КХ)",
        units: [1, 6],
        steps: [
          {
            id: newItemId("STP"),
            name: "Замішування",
            ingredients: [
              {
                ingredientId: newItemId("ING"),
                countByUnits: [[1, 292], [6, 1752]]
              }
            ],
            humanResources: [
              {
                peopleCount: 1,
                countByUnits: [[1, 15], [6, 22]]
              }
            ],
            inventory: [
              {
                deviceId: newItemId("INV"),
                countByUnits: [[1, 1], [6, 1]]
              }
            ],
            instructions: `{"blocks":[{"key":"2ic2d","text":"Відважити воду та пшеничну закваску в чисту і суху ємність відповідного об'єму.","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"7pdcs","text":"Окремо відважити боршно в чисту і суху ємність відповідного об’єму.","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"an4s6","text":"В спіральному тістомісі змішати компоненти з послідовності (1) на протязі 4—5 хвилин (в залежності від кількості замісу).","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}`
          }
        ]
      };

      const insertRes = await chai
        .request(app.server())
        .post(`/techMaps/`)
        .type("application/json")
        .send(JSON.stringify(newTechMap));

      expect(insertRes).to.have.status(201);

      const getNewRes = await chai
        .request(app.server())
        .get(`/techMaps/${newTechMap.id}`);

      expect(getNewRes).to.have.status(200);
      expect(getNewRes.body).containSubset([newTechMap]);
      expect(getNewRes.body[0]).to.have.property("version");

      const insertVersion = getNewRes.body[0].version;

      const modifiedMap = {
        ...newTechMap,
        name: "Хліб Китайський (КХ)"
      };

      const putRes = await chai
        .request(app.server())
        .put(`/techMaps/`)
        .type("application/json")
        .send(JSON.stringify(modifiedMap));

      expect(putRes).to.have.status(201);

      const getRes = await chai.request(app.server()).get(`/techMaps/${modifiedMap.id}`);

      expect(getRes).to.have.status(200);
      expect(getRes.body[1]).containSubset(modifiedMap);
      expect(getRes.body[1]).to.have.property("version");
      expect(getRes.body[1].version).to.equal(insertVersion + 1);
    });

    it("should not bump up version when unmodified techmap put", async () => {
      const id = newItemId("TM");

      const newTechMap = {
        id,
        name: "Хліб Французький (КХ)",
        units: [1, 6],
        steps: [
          {
            id: newItemId("STP"),
            name: "Замішування",
            ingredients: [
              {
                ingredientId: newItemId("ING"),
                countByUnits: [[1, 292], [6, 1752]]
              }
            ],
            humanResources: [
              {
                peopleCount: 1,
                countByUnits: [[1, 15], [6, 22]]
              }
            ],
            inventory: [
              {
                deviceId: newItemId("INV"),
                countByUnits: [[1, 1], [6, 1]]
              }
            ],
            instructions: `{"blocks":[{"key":"2ic2d","text":"Відважити воду та пшеничну закваску в чисту і суху ємність відповідного об'єму.","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"7pdcs","text":"Окремо відважити боршно в чисту і суху ємність відповідного об’єму.","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"an4s6","text":"В спіральному тістомісі змішати компоненти з послідовності (1) на протязі 4—5 хвилин (в залежності від кількості замісу).","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}`
          }
        ]
      };

      const insertRes = await chai
        .request(app.server())
        .post(`/techMaps/`)
        .type("application/json")
        .send(JSON.stringify(newTechMap));

      expect(insertRes).to.have.status(201);

      const getNewRes = await chai
        .request(app.server())
        .get(`/techMaps/${newTechMap.id}/HEAD`);

      expect(getNewRes).to.have.status(200);
      expect(getNewRes.body).containSubset(newTechMap);
      expect(getNewRes.body).to.have.property("version");

      const insertVersion = getNewRes.body.version;

      const notModifiedMap = { ...getNewRes.body };

      const putRes = await chai
        .request(app.server())
        .put(`/techMaps/`)
        .type("application/json")
        .send(JSON.stringify(notModifiedMap));

      expect(putRes).to.have.status(400);

      const getRes = await chai
        .request(app.server())
        .get(`/techMaps/${newTechMap.id}/HEAD`);

      expect(getRes).to.have.status(200);
      expect(getRes.body).containSubset(notModifiedMap);
      expect(getNewRes.body).to.have.property("version");
      expect(getNewRes.body.version).to.equal(insertVersion);
    });

    it("should be able to return latest version by special name id", async () => {
      const id = newItemId("TM");

      const newTechMap = {
        id,
        name: "Хліб Французький (КХ)",
        units: [1, 6],
        steps: [
          {
            id: newItemId("STP"),
            name: "Замішування",
            ingredients: [
              {
                ingredientId: newItemId("ING"),
                countByUnits: [[1, 292], [6, 1752]]
              }
            ],
            humanResources: [
              {
                peopleCount: 1,
                countByUnits: [[1, 15], [6, 22]]
              }
            ],
            inventory: [
              {
                deviceId: newItemId("INV"),
                countByUnits: [[1, 1], [6, 1]]
              }
            ],
            instructions: `{"blocks":[{"key":"2ic2d","text":"Відважити воду та пшеничну закваску в чисту і суху ємність відповідного об'єму.","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"7pdcs","text":"Окремо відважити боршно в чисту і суху ємність відповідного об’єму.","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"an4s6","text":"В спіральному тістомісі змішати компоненти з послідовності (1) на протязі 4—5 хвилин (в залежності від кількості замісу).","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}`
          }
        ]
      };

      await app.getApp().insertTechMap(newTechMap);

      const modifiedMap = {
        ...newTechMap,
        name: "Хліб Китайський (КХ)"
      };

      const putRes = await chai
        .request(app.server())
        .put(`/techMaps/`)
        .type("application/json")
        .send(JSON.stringify(modifiedMap));

      expect(putRes).to.have.status(201);

      const getRes = await chai
        .request(app.server())
        .get(`/techMaps/${modifiedMap.id}/HEAD`);

      expect(getRes).to.have.status(200);
      expect(getRes.body).containSubset(modifiedMap);
    });

    it("newly inserted techmap should be availavle in collection", async () => {
      const id = newItemId("TM");

      const newTechMap = {
        id,
        name: "Хліб Французький (КХ)",
        units: [1, 6],
        steps: [
          {
            id: newItemId("STP"),
            name: "Замішування",
            ingredients: [
              {
                ingredientId: newItemId("ING"),
                countByUnits: [[1, 292], [6, 1752]]
              }
            ],
            humanResources: [
              {
                peopleCount: 1,
                countByUnits: [[1, 15], [6, 22]]
              }
            ],
            inventory: [
              {
                deviceId: newItemId("INV"),
                countByUnits: [[1, 1], [6, 1]]
              }
            ],
            instructions: `{"blocks":[{"key":"2ic2d","text":"Відважити воду та пшеничну закваску в чисту і суху ємність відповідного об'єму.","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"7pdcs","text":"Окремо відважити боршно в чисту і суху ємність відповідного об’єму.","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"an4s6","text":"В спіральному тістомісі змішати компоненти з послідовності (1) на протязі 4—5 хвилин (в залежності від кількості замісу).","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}`
          }
        ]
      };

      const insertRes = await chai
        .request(app.server())
        .post(`/techMaps/`)
        .type("application/json")
        .send(JSON.stringify(newTechMap));

      expect(insertRes).to.have.status(201);
      expect(insertRes).to.have.header("Location", "/techMaps/" + id);

      const getRes = await chai.request(app.server()).get("/techMaps");

      expect(getRes).to.have.status(200);
      expect(getRes.body).containSubset([newTechMap]);
    });

    it("getting techmap without version specified should return collection of all versions", async () => {
      const id = newItemId("TM");

      const newTechMap = {
        id,
        name: "Хліб Французький (КХ)",
        units: [1, 6],
        steps: [
          {
            id: newItemId("STP"),
            name: "Замішування",
            ingredients: [
              {
                ingredientId: newItemId("ING"),
                countByUnits: [[1, 292], [6, 1752]]
              }
            ],
            humanResources: [
              {
                peopleCount: 1,
                countByUnits: [[1, 15], [6, 22]]
              }
            ],
            inventory: [
              {
                deviceId: newItemId("INV"),
                countByUnits: [[1, 1], [6, 1]]
              }
            ],
            instructions: `{"blocks":[{"key":"2ic2d","text":"Відважити воду та пшеничну закваску в чисту і суху ємність відповідного об'єму.","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"7pdcs","text":"Окремо відважити боршно в чисту і суху ємність відповідного об’єму.","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"an4s6","text":"В спіральному тістомісі змішати компоненти з послідовності (1) на протязі 4—5 хвилин (в залежності від кількості замісу).","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}`
          }
        ]
      };

      await app.getApp().insertTechMap(newTechMap);

      const modifiedMap = {
        ...newTechMap,
        name: "Хліб Китайський (КХ)"
      };

      const putRes = await chai
        .request(app.server())
        .put(`/techMaps/`)
        .type("application/json")
        .send(JSON.stringify(modifiedMap));

      expect(putRes).to.have.status(201);

      const getRes = await chai.request(app.server()).get(`/techMaps/${modifiedMap.id}`);

      expect(getRes).to.have.status(200);
      expect(getRes.body).containSubset([newTechMap, modifiedMap]);
    });

    it("should return specific version of techMap requested", async () => {
      const id = newItemId("TM");

      const newTechMap = {
        id,
        name: "Хліб Французький (КХ)",
        units: [1, 6],
        steps: [
          {
            id: newItemId("STP"),
            name: "Замішування",
            ingredients: [
              {
                ingredientId: newItemId("ING"),
                countByUnits: [[1, 292], [6, 1752]]
              }
            ],
            humanResources: [
              {
                peopleCount: 1,
                countByUnits: [[1, 15], [6, 22]]
              }
            ],
            inventory: [
              {
                deviceId: newItemId("INV"),
                countByUnits: [[1, 1], [6, 1]]
              }
            ],
            instructions: `{"blocks":[{"key":"2ic2d","text":"Відважити воду та пшеничну закваску в чисту і суху ємність відповідного об'єму.","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"7pdcs","text":"Окремо відважити боршно в чисту і суху ємність відповідного об’єму.","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"an4s6","text":"В спіральному тістомісі змішати компоненти з послідовності (1) на протязі 4—5 хвилин (в залежності від кількості замісу).","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}`
          }
        ]
      };

      await app.getApp().insertTechMap(newTechMap);

      const modifiedMap = {
        ...newTechMap,
        name: "Хліб Китайський (КХ)"
      };

      const putRes = await chai
        .request(app.server())
        .put(`/techMaps/`)
        .type("application/json")
        .send(JSON.stringify(modifiedMap));

      expect(putRes).to.have.status(201);

      const getRes = await chai
        .request(app.server())
        .get(`/techMaps/${modifiedMap.id}/0`);

      expect(getRes).to.have.status(200);
      expect(getRes.body).containSubset(newTechMap);
      expect(getRes.body.version).equal(0);
    });

    it("should return only latest versions of techMaps when get with no params is requested", async () => {
      const id = newItemId("TM");

      const first = {
        id,
        name: "Хліб Французький (КХ)",
        units: [1, 6],
        steps: [
          {
            id: newItemId("STP"),
            name: "Замішування",
            ingredients: [
              {
                ingredientId: newItemId("ING"),
                countByUnits: [[1, 292], [6, 1752]]
              }
            ],
            humanResources: [
              {
                peopleCount: 1,
                countByUnits: [[1, 15], [6, 22]]
              }
            ],
            inventory: [
              {
                deviceId: newItemId("INV"),
                countByUnits: [[1, 1], [6, 1]]
              }
            ],
            instructions: `{"blocks":[{"key":"2ic2d","text":"Відважити воду та пшеничну закваску в чисту і суху ємність відповідного об'єму.","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"7pdcs","text":"Окремо відважити боршно в чисту і суху ємність відповідного об’єму.","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"an4s6","text":"В спіральному тістомісі змішати компоненти з послідовності (1) на протязі 4—5 хвилин (в залежності від кількості замісу).","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}`
          }
        ]
      };

      const firstModified = { ...first, name: "Хліб Китайський (КХ)" };
      const second = { ...first, id: newItemId("TM"), name: "Хліб Корейський (КХ)" };
      const secondModified = { ...second, name: "Хліб Тайський (КХ)" };

      await app.getApp().insertTechMap(first);
      await app.getApp().insertTechMapNewVersion(firstModified);
      await app.getApp().insertTechMap(second);
      await app.getApp().insertTechMapNewVersion(secondModified);

      const getRes = await chai.request(app.server()).get(`/techMaps`);

      expect(getRes).to.have.status(200);
      expect(getRes.body.length).equal(2);
      expect(getRes.body).containSubset([firstModified, secondModified]);
    });
  });
});
