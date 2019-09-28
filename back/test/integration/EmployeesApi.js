process.env.NODE_ENV = "test";

const KhPosNodeTestApp = require("../../KhPosNodeTestApp");
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

function newEmployeeId() {
  return "EMP-" + uuid.v4();
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


  describe("/employees", () => {

    it("should provide application/json content type header", done => {
      chai
        .request(app.server())
        .get("/employees")
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
      checkExpectations(await chai.request(app.server()).get("/employees"));
      checkExpectations(await chai.request(app.server()).post("/employees"));
      checkExpectations(await chai.request(app.server()).patch("/employees"));
    });
  });

  it("should return empty array on clear database", async () => {
    const res = await chai.request(app.server()).get("/employees");
    expect(res).to.have.status(200);
    expect(res.body).to.be.an('array');
    expect(res.body.length).to.equal(0);
  });

  it("should return collection of one element when one element is in the database", async () => {
    await app.getApp().insertEmployee({
      id: newEmployeeId(),
      firstName: "Василь",
      color: "rgb(216, 216, 216)"
    });
    const res = await chai
      .request(app.server())
      .get("/employees");

    expect(res).to.have.status(200);
    expect(res.body).to.be.an('array');
    expect(res.body.length).to.equal(1);

    expect(res.body).to.containSubset([{
      firstName: "Василь",
      color: "rgb(216, 216, 216)"
    }]);

  });

  it("Should return 400 if invalid employee is requested", async () => {
    const res = await chai.request(app.server()).get(`/employees/invalid_staff_id`);
    expect(res).to.have.status(400);
  });

  it("Should return 404 if unexisting employee is requested", async () => {
    const res = await chai.request(app.server()).get(`/employees/${newEmployeeId()}`);
    expect(res).to.have.status(404);
  });

  it("Modification of existing employee should work fine", async () => {
    const vasylId = await app.getApp().insertEmployee({
      id: newEmployeeId(),
      firstName: "Василь",
      color: "rgb(216, 216, 216)"
    });
    const modifyRes = await chai.request(app.server()).put(`/employees/${vasylId}`).type(
      "application/json").send(
      JSON.stringify({
        id: vasylId,
        firstName: "Онуфрій",
        color: "rgb(100, 100, 100)"
      })
    );

    expect(modifyRes).to.have.status(200);

    const getStaffRes = await chai
      .request(app.server())
      .get("/employees");

    expect(getStaffRes).to.have.status(200);
    expect(getStaffRes.body).to.be.an('array');
    expect(getStaffRes.body.length).to.equal(1);

    expect(getStaffRes.body).to.containSubset([{
      id: vasylId,
      firstName: "Онуфрій",
      color: "rgb(100, 100, 100)"
    }]);

  });

  it("Modification of unexisting employee should return 404", async () => {
    const vasylId = newEmployeeId();
    await app.getApp().insertEmployee({
      id: vasylId,
      firstName: "Василь",
      color: "rgb(216, 216, 216)"
    });

    const res = await chai.request(app.server()).patch(`/employees/${newEmployeeId()}`).type(
      "application/json").send(JSON.stringify({
      id: vasylId,
      firstName: "Василь",
      color: "rgb(216, 216, 216)"
    }));

    expect(res).to.have.status(404);
  });

});