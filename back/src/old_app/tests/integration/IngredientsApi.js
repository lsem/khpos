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

function newIngredientId() {
  return "ING-" + uuid.v4();
}

function defaultIngredient() {
  return {
    id: newIngredientId(),
    name: "Some awesome ingredient name",
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


  describe("/ingredients", () => {

    it("should provide application/json content type header", done => {
      chai
        .request(app.server())
        .get("/ingredients")
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
      checkExpectations(await chai.request(app.server()).get("/ingredients"));
      checkExpectations(await chai.request(app.server()).post("/ingredients"));
    });
  });

  it("should return empty array on clear database", async () => {
    const res = await chai.request(app.server()).get("/ingredients");
    expect(res).to.have.status(200);
    expect(res.body).to.be.an('array');
    expect(res.body.length).to.equal(0);
  });

  it("should return collection of one element when one element is in the database", async () => {
    const ingredient = defaultIngredient();
    await app.getApp().insertIngredient(ingredient);
    const res = await chai
      .request(app.server())
      .get("/ingredients");

    expect(res).to.have.status(200);
    expect(res.body).to.be.an('array');
    expect(res.body.length).to.equal(1);

    expect(res.body).to.containSubset([ingredient]);

  });

  it("Should return 400 if invalid ingredient is requested", async () => {
    const res = await chai.request(app.server()).get(`/ingredients/invalid_ingredient_id`);
    expect(res).to.have.status(400);
  });

  it("Should return 404 if unexisting ingredient is requested", async () => {
    const res = await chai.request(app.server()).get(`/ingredients/${newIngredientId()}`);
    expect(res).to.have.status(404);
  });

  it("should not allow to insert new ingredient if such already exist", async () => {
    const newIngredient = defaultIngredient();

    await app.getApp().insertIngredient(newIngredient);

    const insertRes = await chai
      .request(app.server())
      .post(`/ingredients/`)
      .type("application/json")
      .send(JSON.stringify(newIngredient));

    expect(insertRes).to.have.status(400);
  });
});