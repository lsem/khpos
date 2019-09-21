process.env.NODE_ENV = "test";

const KhPosNodeTestApp = require("../../KhPosNodeTestApp");
const chai = require("chai");
var expect = require("chai").expect;
var assert = require("chai").assert;
var should = require("chai").should;
const uuid = require("uuid");
const chaiHttp = require("chai-http");
var chaiSubset = require("chai-subset");

chai.use(chaiHttp);
chai.use(chaiSubset);

function newTechMapId() {
  return `TM-${uuid.v4()}`;
}

function newStepId() {
  return `STP-${uuid.v4()}`;
}

function newIngredientId() {
  return `ING-${uuid.v4()}`;
}

function newInventoryId() {
  return `INV-${uuid.v4()}`;
}

function defaultTechMap() {
  return {
    id: newTechMapId(),
    name: "Хліб Французький (КХ)",
    units: [1, 6],
    steps: [
      {
        id: newStepId(),
        name: "Замішування",
        ingredients: [
          {
            ingredientId: newIngredientId(),
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
            deviceId: newInventoryId(),
            countByUnits: [[1, 1], [6, 1]]
          }
        ],
        instructions: `{"blocks":[{"key":"2ic2d","text":"Відважити воду та пшеничну закваску в чисту і суху ємність відповідного об'єму.","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"7pdcs","text":"Окремо відважити боршно в чисту і суху ємність відповідного об’єму.","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"an4s6","text":"В спіральному тістомісі змішати компоненти з послідовності (1) на протязі 4—5 хвилин (в залежності від кількості замісу).","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}`
      }
    ]
  };
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
      const res = await chai.request(app.server()).get(`/techmaps/${newTechMapId()}`);
      expect(res).to.have.status(404);
    });

    it("should bump up version when modified techmap put", async () => {
      const newTechMap = { ...defaultTechMap(), name: "original" };

      await app.getApp().insertTechMap(newTechMap);

      const modifiedMap = { ...newTechMap, name: "modified" };

      await app.getApp().updateTechMap(modifiedMap.id, modifiedMap);

      const getRes = await chai.request(app.server()).get(`/techMaps/${newTechMap.id}`);

      expect(getRes).to.have.status(200);
      expect(getRes.body).containSubset([
        { name: "original", version: 0 },
        { name: "modified", version: 1 }
      ]);
    });

    it("should not bump up version when unmodified techmap put", async () => {
      const newTechMap = defaultTechMap();

      await app.getApp().insertTechMap(newTechMap);

      const notModifiedMap = await app.getApp().getTechMapHead(newTechMap.id);

      const putRes = await chai
        .request(app.server())
        .put(`/techMaps/${newTechMap.id}`)
        .type("application/json")
        .send(JSON.stringify(notModifiedMap));

      expect(putRes).to.have.status(400);

      const getRes = await chai
        .request(app.server())
        .get(`/techMaps/${newTechMap.id}/HEAD`);

      expect(getRes).to.have.status(200);
      expect(getRes.body).containSubset({ version: 0 });
    });

    it("should be able to return latest version by special name id", async () => {
      const newTechMap = { ...defaultTechMap(), name: "original" };

      await app.getApp().insertTechMap(newTechMap);

      const modifiedMap = { ...newTechMap, name: "modified" };

      await app.getApp().updateTechMap(modifiedMap.id, modifiedMap);

      const getRes = await chai
        .request(app.server())
        .get(`/techMaps/${newTechMap.id}/HEAD`);

      expect(getRes).to.have.status(200);
      expect(getRes.body).containSubset({ name: "modified", version: 1 });
    });

    it("newly inserted techmap should be availavle in collection", async () => {
      const newTechMap = defaultTechMap();

      const insertRes = await chai
        .request(app.server())
        .post(`/techMaps/`)
        .type("application/json")
        .send(JSON.stringify(newTechMap));

      expect(insertRes).to.have.status(201);
      expect(insertRes).to.have.header("Location", "/techMaps/" + newTechMap.id);

      const getRes = await chai.request(app.server()).get("/techMaps");

      expect(getRes).to.have.status(200);
      expect(getRes.body).containSubset([newTechMap]);
    });

    it("getting techmap without version specified should return collection of all versions", async () => {
      const newTechMap = { ...defaultTechMap(), name: "original" };

      await app.getApp().insertTechMap(newTechMap);

      const modifiedMap = { ...newTechMap, name: "modified" };

      await app.getApp().updateTechMap(modifiedMap.id, modifiedMap);

      const getRes = await chai.request(app.server()).get(`/techMaps/${newTechMap.id}`);

      expect(getRes).to.have.status(200);
      expect(getRes.body).containSubset([{ version: 0 }, { version: 1 }]);
    });

    it("should return specific version of techMap requested", async () => {
      const newTechMap = { ...defaultTechMap(), name: "first" };

      await app.getApp().insertTechMap(newTechMap);

      const modifiedMap = { ...newTechMap, name: "second" };

      await app.getApp().updateTechMap(modifiedMap.id, modifiedMap);

      const getRes = await chai.request(app.server()).get(`/techMaps/${newTechMap.id}/0`);

      expect(getRes).to.have.status(200);
      expect(getRes.body).containSubset({ name: "first", version: 0 });
    });

    it("should return only latest versions of techMaps when get with no params is requested", async () => {
      const first = { ...defaultTechMap(), name: "first" };
      const firstModified = { ...first, name: "first modified" };
      const second = { ...defaultTechMap(), name: "second" };
      const secondModified = { ...second, name: "second modified" };

      await app.getApp().insertTechMap(first);
      await app.getApp().updateTechMap(firstModified.id, firstModified);
      await app.getApp().insertTechMap(second);
      await app.getApp().updateTechMap(secondModified.id, secondModified);

      const getRes = await chai.request(app.server()).get(`/techMaps`);

      expect(getRes).to.have.status(200);
      expect(getRes.body.length).equal(2);
      expect(getRes.body).containSubset([
        { name: "first modified", version: 1 },
        { name: "second modified", version: 1 }
      ]);
    });
  });
});
