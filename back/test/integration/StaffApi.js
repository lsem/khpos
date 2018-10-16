process.env.NODE_NV = "test";

if (!process.env.POSTER_API_LINK || !process.env.POSTER_SECURITY_TOKEN) {
  throw new Error("No POSTER_API_LINK/POSTER_SECURITY_TOKEN env variable set");
}

const KhPosNodeTestApp = require("../../KhPosNodeTestApp");
const chai = require("chai");
var expect = require("chai").expect;
var assert = require("chai").assert;
var should = require("chai").should;
const moment = require("moment");
const uuid = require('uuid');
const chaiHttp = require("chai-http");
var chaiSubset = require('chai-subset');
const _ = require('lodash');

chai.use(chaiHttp);
chai.use(chaiSubset);

function newJobId() {
  return 'JOB-' + uuid.v4()
}

function newTechMapId() {
  return 'TM-' + uuid.v4()
}

function newTaskId() {
  return 'TASK-' + uuid.v4()
}

function newAssigneId() {
  return 'ASS-' + uuid.v4()
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


  describe("/staff", () => {

    it("should provide application/json content type header", done => {
      chai
        .request(app.server())
        .get("/staff")
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
      checkExpectations(await chai.request(app.server()).get("/staff"));
      checkExpectations(await chai.request(app.server()).post("/staff"));
      checkExpectations(await chai.request(app.server()).patch("/staff"));
    });
  });

  it("should return empty array on clear database", async () => {
    const res = await chai.request(app.server()).get("/staff");
    expect(res).to.have.status(200);
    expect(res.body).to.be.an('array');
    expect(res.body.length).to.equal(0);
  });

  it("should return collection of one element when one element is in the database", async () => {
    const insertedStaffId = newAssigneId();
    await app.getApp().insertStaff({
      id: insertedStaffId,
      firstName: "Василь",
      color: "rgb(216, 216, 216)"
    });
    const res = await chai
      .request(app.server())
      .get("/staff");

    expect(res).to.have.status(200);
    expect(res.body).to.be.an('array');
    expect(res.body.length).to.equal(1);

    expect(res.body).to.containSubset([{
      id: insertedStaffId,
      firstName: "Василь",
      color: "rgb(216, 216, 216)"
    }]);

  });

  it("Should return 400 if invalid staff is requested", async () => {
    const res = await chai.request(app.server()).get(`/staff/invalid_staff_id`);
    expect(res).to.have.status(400);
  });

  it("Should return 404 if unexisting staff is requested", async () => {
    const res = await chai.request(app.server()).get(`/staff/${newAssigneId()}`);
    expect(res).to.have.status(404);
  });

  it("Modification of existing staff should work fine", async () => {
    const vasylId = newAssigneId();
    await app.getApp().insertStaff({
      id: vasylId,
      firstName: "Василь",
      color: "rgb(216, 216, 216)"
    });
    const modifyRes = await chai.request(app.server()).patch(`/staff/${vasylId}`).type(
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
      .get("/staff");

    expect(getStaffRes).to.have.status(200);
    expect(getStaffRes.body).to.be.an('array');
    expect(getStaffRes.body.length).to.equal(1);

    expect(getStaffRes.body).to.containSubset([{
      id: vasylId,
      firstName: "Онуфрій",
      color: "rgb(100, 100, 100)"
    }]);

  });

  it("Modification of unexisting staff should return 404", async () => {
    const vasylId = newAssigneId();
    await app.getApp().insertStaff({
      id: vasylId,
      firstName: "Василь",
      color: "rgb(216, 216, 216)"
    });

    const res = await chai.request(app.server()).patch(`/staff/${newAssigneId()}`).type(
      "application/json").send(JSON.stringify({
      id: vasylId,
      firstName: "Василь",
      color: "rgb(216, 216, 216)"
    }));

    expect(res).to.have.status(404);
  });

});