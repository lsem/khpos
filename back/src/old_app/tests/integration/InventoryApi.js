process.env.NODE_ENV = "test";

const KhPosNodeTestApp = require("./KhPosNodeTestApp");
const chai = require("chai");
var expect = require("chai").expect;
var assert = require("chai").assert;
var should = require("chai").should;
const chaiHttp = require("chai-http");
var chaiSubset = require('chai-subset');
const _ = require('lodash');
const uuid = require("uuid");

chai.use(chaiHttp);
chai.use(chaiSubset);

function newInventoryId() {
  return "INV-" + uuid.v4();
}

function defaultInventory() {
  return {
    id: newInventoryId(),
    name: "Some awesome inventory name",
    units: "шт"
  }
}

// https://mherman.org/blog/testing-node-and-express/#integration-tests
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
    await app.getApp().clearStorage()
  })


  describe("/inventory", () => {

    it("should provide application/json content type header", done => {
      chai
        .request(app.server())
        .get("/inventory")
        .end((err, res) => {
          expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
          done();
        });
    });

    /////////////////////////////////////////////////////////////////////////////////////////

    it("should be CORS enabled", async () => {
      // TODO: https://github.com/lsem/khpos/issues/10
      const checkExpectations = (res) => {
        expect(res).to.have.header('Access-Control-Allow-Origin', '*');
        expect(res).to.have.header('Access-Control-Allow-Methods', undefined);
        expect(res).to.have.header('Access-Control-Allow-Headers', undefined);
      };
      checkExpectations(await chai.request(app.server()).get("/inventory"));
      checkExpectations(await chai.request(app.server()).post("/inventory"));
    });
  });

  it("should return empty array on clear database", async () => {
    const res = await chai.request(app.server()).get("/inventory");
    expect(res).to.have.status(200);
    expect(res.body).to.be.an('array');
    expect(res.body.length).to.equal(0);
  });

  it("should return collection of one element when one element is in the database", async () => {
    const device = defaultInventory();
    await app.getApp().insertDevice(device);
    const res = await chai
      .request(app.server())
      .get("/inventory");

    expect(res).to.have.status(200);
    expect(res.body).to.be.an('array');
    expect(res.body.length).to.equal(1);

    expect(res.body).to.containSubset([device]);

  });

  it("Should return 400 if invalid inventory is requested", async () => {
    const res = await chai.request(app.server()).get(`/inventory/invalid_inventory_id`);
    expect(res).to.have.status(400);
  });

  it("Should return 404 if unexisting inventory is requested", async () => {
    const res = await chai.request(app.server()).get(`/inventory/${newInventoryId()}`);
    expect(res).to.have.status(404);
  });

  it("should not allow to insert new inventory if such already exist", async () => {
    const newDevice = defaultInventory();

    await app.getApp().insertDevice(newDevice);

    const insertRes = await chai
      .request(app.server())
      .post(`/inventory/`)
      .type("application/json")
      .send(JSON.stringify(newDevice));

    expect(insertRes).to.have.status(400);
  });
});