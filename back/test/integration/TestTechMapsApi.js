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

function newTechMapId() {
  return "TM-" + uuid.v4();
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

    it("should return 404 if unexisting job is requested", async () => {
      const res = await chai.request(app.server()).get(`/techmaps/${newTechMapId()}`);
      expect(res).to.have.status(404);
    });

    it("should bump up version when modified techmap put", async () => {
      // todo: make sure all fields are checked.
      const id = newTechMapId();

      const newTechMap = {
        id,
        name: "Хліб Французький (КХ)",
        units: [1, 6],
        steps: [
          {
            id: "STP-XXX-YYY-ZZZ-YY0",
            name: "Замішування",
            ingredients: [
              {
                ingredientId: "ING-XXX-YYY-ZZZ-YY0",
                countByUnits: new Map([[1, 292], [6, 1752]])
              }
            ],
            humanResources: [
              {
                peopleCount: 1,
                countByUnits: new Map([[1, 15], [6, 22]])
              }
            ],
            inventory: [
              {
                deviceId: "INV-XXX-YYY-ZZZ,YY0",
                countByUnits: new Map([[1, 1], [6, 1]])
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
        .get(`/techMaps/${modifiedMap.id}`);

      expect(getNewRes).to.have.status(200);
      expect(getNewRes.body).to.deep.include(newTechMap);
      expect(getNewRes.body).to.have.property("version");

      const insertVersion = getNewRes.body.version;

      const modifiedMap = {
        ...newTechMap,
        name: "Хліб Китайський (КХ)"
      };

      const putRes = await chai
        .request(app.server())
        .put(`/techMaps/${modifiedMap.id}`)
        .type("application/json")
        .send(JSON.stringify(modifiedMap));

      expect(putRes).to.have.status(201);

      const getRes = await chai.request(app.server()).get(`/techMaps/${modifiedMap.id}`);

      expect(getRes).to.have.status(200);
      expect(getRes.body).to.deep.include(modifiedMap);
      expect(getNewRes.body).to.have.property("version");
      expect(getNewRes.body.version).to.be.above(insertVersion);
    });

    it("should not bump up version when unmodified techmap put", async () => {
      // todo: consider returning error or some not-modified for this case,
      // or emit warning at least, since it looks like clients logic error.
      const id = newTechMapId();

      const newTechMap = {
        id,
        name: "Хліб Французький (КХ)",
        units: [1, 6],
        steps: [
          {
            id: "STP-XXX-YYY-ZZZ-YY0",
            name: "Замішування",
            ingredients: [
              {
                ingredientId: "ING-XXX-YYY-ZZZ-YY0",
                countByUnits: new Map([[1, 292], [6, 1752]])
              }
            ],
            humanResources: [
              {
                peopleCount: 1,
                countByUnits: new Map([[1, 15], [6, 22]])
              }
            ],
            inventory: [
              {
                deviceId: "INV-XXX-YYY-ZZZ,YY0",
                countByUnits: new Map([[1, 1], [6, 1]])
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
        .get(`/techMaps/${modifiedMap.id}`);

      expect(getNewRes).to.have.status(200);
      expect(getNewRes.body).to.deep.include(newTechMap);
      expect(getNewRes.body).to.have.property("version");

      const insertVersion = getNewRes.body.version;

      const notModifiedMap = { ...newTechMap };

      const putRes = await chai
        .request(app.server())
        .put(`/techMaps/${notModifiedMap.id}`)
        .type("application/json")
        .send(JSON.stringify(notModifiedMap));

      expect(putRes).to.have.status(417);

      const getRes = await chai
        .request(app.server())
        .get(`/techMaps/${notModifiedMap.id}`);

      expect(getRes).to.have.status(200);
      expect(getRes.body).to.deep.include(notModifiedMap);
      expect(getNewRes.body).to.have.property("version");
      expect(getNewRes.body.version).to.equal(insertVersion);
    });

    it("should be able to return latest version by special name id", async () => {
      // todo: test /techmaps/TM-XXXX-YYYY-ZZZZ-QQQQ/HEAD
      const id = newTechMapId();

      const newTechMap = {
        id,
        name: "Хліб Французький (КХ)",
        units: [1, 6],
        steps: [
          {
            id: "STP-XXX-YYY-ZZZ-YY0",
            name: "Замішування",
            ingredients: [
              {
                ingredientId: "ING-XXX-YYY-ZZZ-YY0",
                countByUnits: new Map([[1, 292], [6, 1752]])
              }
            ],
            humanResources: [
              {
                peopleCount: 1,
                countByUnits: new Map([[1, 15], [6, 22]])
              }
            ],
            inventory: [
              {
                deviceId: "INV-XXX-YYY-ZZZ,YY0",
                countByUnits: new Map([[1, 1], [6, 1]])
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

      const modifiedMap = {
        ...newTechMap,
        name: "Хліб Китайський (КХ)"
      };

      const putRes = await chai
        .request(app.server())
        .put(`/techMaps/${modifiedMap.id}`)
        .type("application/json")
        .send(JSON.stringify(modifiedMap));

      expect(putRes).to.have.status(201);

      const getRes = await chai
        .request(app.server())
        .get(`/techMaps/${modifiedMap.id}/HEAD`);

      expect(getRes).to.have.status(200);
      expect(getRes.body).to.deep.include(modifiedMap);
    });

    it("newly inserted techmap should be availavle in collection", async () => {
      // todo: test get /techmaps/
      const id = newTechMapId();

      const newTechMap = {
        id,
        name: "Хліб Французький (КХ)",
        units: [1, 6],
        steps: [
          {
            id: "STP-XXX-YYY-ZZZ-YY0",
            name: "Замішування",
            ingredients: [
              {
                ingredientId: "ING-XXX-YYY-ZZZ-YY0",
                countByUnits: new Map([[1, 292], [6, 1752]])
              }
            ],
            humanResources: [
              {
                peopleCount: 1,
                countByUnits: new Map([[1, 15], [6, 22]])
              }
            ],
            inventory: [
              {
                deviceId: "INV-XXX-YYY-ZZZ,YY0",
                countByUnits: new Map([[1, 1], [6, 1]])
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
      expect(getRes.body).to.be.array();
      expect(getRes.body).to.deep.include(newTechMap);
    });

    it("getting techmap without version specified should return collection of all versions", async () => {
      // todo: teset get /techmaps/TM-XXXX-YYYY-ZZZZ-QQQQ
      const id = newTechMapId();

      const newTechMap = {
        id,
        name: "Хліб Французький (КХ)",
        units: [1, 6],
        steps: [
          {
            id: "STP-XXX-YYY-ZZZ-YY0",
            name: "Замішування",
            ingredients: [
              {
                ingredientId: "ING-XXX-YYY-ZZZ-YY0",
                countByUnits: new Map([[1, 292], [6, 1752]])
              }
            ],
            humanResources: [
              {
                peopleCount: 1,
                countByUnits: new Map([[1, 15], [6, 22]])
              }
            ],
            inventory: [
              {
                deviceId: "INV-XXX-YYY-ZZZ,YY0",
                countByUnits: new Map([[1, 1], [6, 1]])
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

      const modifiedMap = {
        ...newTechMap,
        name: "Хліб Китайський (КХ)"
      };

      const putRes = await chai
        .request(app.server())
        .put(`/techMaps/${modifiedMap.id}`)
        .type("application/json")
        .send(JSON.stringify(modifiedMap));

      expect(putRes).to.have.status(201);

      const getRes = await chai.request(app.server()).get(`/techMaps/${modifiedMap.id}`);

      expect(getRes).to.have.status(200);
      expect(getRes.body).to.be.array();
      expect(getRes.body).to.be.ofSize(2);
      expect(getRes.body).to.have.deep.members([newTechMap, modifiedMap]);
    });
  });
});
