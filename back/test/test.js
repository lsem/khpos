process.env.NODE_NV = "test";
if (!process.env.POSTER_API_LINK || !process.env.POSTER_SECURITY_TOKEN) {
  throw new Error("No POSTER_API_LINK/POSTER_SECURITY_TOKEN env variable set");
}

const KhPosNodeTestApp = require("../KhPosNodeTestApp");
const chai = require("chai");
var expect = require("chai").expect;
var assert = require("chai").assert;
var should = require("chai").should;
const moment = require("moment");
const uuid = require('uuid');
const chaiHttp = require("chai-http");
var chaiSubset = require('chai-subset');

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
  return 'ASSIGNEE-' + uuid.v4()
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

  describe("/login", () => {
    it("Posting into login with valid credentials should return 200", done => {
      // TODO: https://github.com/lsem/khpos/issues/11
      //false.should.be.equal(true);
      done();
    });
  });

  describe("/jobs", () => {

    it("should provide application/json content type header", done => {
      chai
        .request(app.server())
        .get("/jobs")
        .end((err, res) => {
          expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
          done();
        });
    });

    it("should be CORS enabled", done => {
      // TODO: https://github.com/lsem/khpos/issues/10
      chai
        .request(app.server())
        .get("/jobs")
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.header('Access-Control-Allow-Origin', '*');
          expect(res).to.have.header('Access-Control-Allow-Methods', undefined);
          expect(res).to.have.header('Access-Control-Allow-Headers', undefined);
        });
      done();
    });

    it("should return empty collection on empty database", done => {
      chai
        .request(app.server())
        .get("/jobs")
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.equal(0);
          done();
        });
    });


    it("should return collection of one element when one element is in the database", async () => {
      const insertedJobId = newJobId();
      await app.getApp().insertJob({
        startTime: moment(123456).add(115, "minutes").valueOf(),
        id: insertedJobId,
        column: 0,
        techMap: {
          id: newTechMapId(),
          name: "1",
          tintColor: "rgb(216, 216, 216)",
          tasks: [{
            id: newTaskId(),
            name: "task 1",
            durationMins: 10,
            bgColor: "rgb(216, 216, 216)"
          }]
        }
      });
      const res = await chai
        .request(app.server())
        .get("/jobs");
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.equal(1);

      expect(res.body).to.containSubset([{
        startTime: "1970-01-01T01:57:03.456Z",
        id: insertedJobId,
        column: 0,
        techMap: {}
      }]);
    });

    // it("should return empty collection on empty database", done => {
    //   assert.isOk(false, "this will fail");
    //   done();
    // });

    // it("should return one collection of one element when one record in the database", done => {
    //   assert.isOk(false, "this will fail");

    //   done();
    // });

    // it("Inserted element should be equal to returned one", done => {
    //   assert.isOk(false, "this will fail");
    //   done();
    // });

    // it("Filtering by start and from date should work", done => {
    //   assert.isOk(false, "this will fail");
    //   done();
    // });

    // it("Filtering should not work with only start or with only end date", done => {
    //   assert.isOk(false, "this will fail");
    //   done();
    // });

    // it("Modyfing jobs collection should work", done => {
    //   assert.isOk(false, "this will fail");
    //   done();
    // });
    // it("Updating existing job by id should work", done => {
    //   assert.isOk(false, "this will fail");
    //   done();
    // });
  }); // jobs
});