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

  beforeEach(async () => {
    await app.getApp().clearStorage()
  })

  async function insertJobAutoCompleted(jobModel) {
    const baseModel = {
      startTime: "1970-01-02T00:00:00.000Z",
      id: "JOB-6c947cf2-7ad4-48a1-b929-5add19033e26",
      column: 0,
      techMap: {
        id: "TM-e4020471-80cc-433b-abfb-fd682224d42e",
        name: "1",
        tintColor: "rgb(216, 216, 216)",
        tasks: [{
          id: "TASK-540b2c24-9ee3-470e-93d6-0758d9f44968",
          name: "task 1",
          durationMins: 10,
          bgColor: "rgb(216, 216, 216)"
        }]
      }
    }
    await app.getApp().insertJob(_.merge(baseModel, jobModel));
    return baseModel;
  }

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

    /////////////////////////////////////////////////////////////////////////////////////////

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

    /////////////////////////////////////////////////////////////////////////////////////////

    it("should return empty collection on empty database", async () => {
      const res = await chai
        .request(app.server())
        .get("/jobs");
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.equal(0);
    });

    /////////////////////////////////////////////////////////////////////////////////////////

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

    /////////////////////////////////////////////////////////////////////////////////////////

    it("should accept jobs with start time specified in ISO", async () => {
      const insertedJobId = newJobId();
      await app.getApp().insertJob({
        startTime: "1970-01-01T01:57:03.456Z",
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
      expect(res.body).to.containSubset([{
        startTime: "1970-01-01T01:57:03.456Z"
      }]);
    });

    /////////////////////////////////////////////////////////////////////////////////////////

    it("should accept jobs with start time specified as Js Time Value", async () => {
      const insertedJobId = newJobId();
      await app.getApp().insertJob({
        startTime: 24 * 60 * 60 * 1000,
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
      expect(res.body).to.containSubset([{
        startTime: "1970-01-02T00:00:00.000Z"
      }]);
    });

    /////////////////////////////////////////////////////////////////////////////////////////

    it("Inserted element should be equal to returned one", async () => {
      await app.getApp().insertJob({
        startTime: "1970-01-02T00:00:00.000Z",
        id: "JOB-6c947cf2-7ad4-48a1-b929-5add19033e26",
        column: 0,
        techMap: {
          id: "TM-e4020471-80cc-433b-abfb-fd682224d42e",
          name: "1",
          tintColor: "rgb(216, 216, 216)",
          tasks: [{
            id: "TASK-540b2c24-9ee3-470e-93d6-0758d9f44968",
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
      expect(res.body).to.containSubset([{
        startTime: "1970-01-02T00:00:00.000Z",
        id: "JOB-6c947cf2-7ad4-48a1-b929-5add19033e26",
        column: 0,
        techMap: {
          id: "TM-e4020471-80cc-433b-abfb-fd682224d42e",
          name: "1",
          tintColor: "rgb(216, 216, 216)",
          tasks: [{
            id: "TASK-540b2c24-9ee3-470e-93d6-0758d9f44968",
            name: "task 1",
            durationMins: 10,
            bgColor: "rgb(216, 216, 216)"
          }]
        }
      }]);
    });

    /////////////////////////////////////////////////////////////////////////////////////////

    it("Filtering by start and from date should return jobs in range", async () => {
      const oneJobId = newJobId(),
        anotherJobId = newJobId();
      const oneJob = await insertJobAutoCompleted({
        id: oneJobId,
        startTime: '1970-01-01T00:00:00.000Z'
      });
      const anotherJob = await insertJobAutoCompleted({
        id: anotherJobId,
        startTime: '1970-01-02T00:00:00.000Z'
      });
      const res = await chai
        .request(app.server())
        .get("/jobs?startTime=1970-01-01T00:00:00.000Z&endTime=1970-01-02T00:00:00.000Z");
      expect(res).to.have.status(200);
      expect(res.body).to.containSubset([{
        startTime: "1970-01-01T00:00:00.000Z",
        id: oneJobId
      }, {
        startTime: "1970-01-02T00:00:00.000Z",
        id: anotherJobId
      }]);
    });

    /////////////////////////////////////////////////////////////////////////////////////////

    it("Filtering by start and from date should return not reutrn out of range left", async () => {
      const oneJobId = newJobId(),
        anotherJobId = newJobId();
      const oneJob = await insertJobAutoCompleted({
        id: oneJobId,
        startTime: '1970-01-01T00:00:00.000Z'
      });
      const anotherJob = await insertJobAutoCompleted({
        id: anotherJobId,
        startTime: '1970-01-02T00:00:00.000Z'
      });
      const res = await chai
        .request(app.server())
        .get("/jobs?fromDate=1970-01-01T00:00:01.000Z&toDate=1970-01-02T00:00:00.000Z");
      expect(res).to.have.status(200);
      expect(res.body).to.not.containSubset([{
        startTime: "1970-01-01T00:00:00.000Z",
        id: oneJobId
      }]);
      expect(res.body).to.containSubset([, {
        startTime: "1970-01-02T00:00:00.000Z",
        id: anotherJobId
      }]);
    });

    /////////////////////////////////////////////////////////////////////////////////////////

    it("Filtering by start and from date should return not reutrn out of range right", async () => {
      const oneJobId = newJobId(),
        anotherJobId = newJobId();
      const oneJob = await insertJobAutoCompleted({
        id: oneJobId,
        startTime: '1970-01-01T00:00:00.000Z'
      });
      const anotherJob = await insertJobAutoCompleted({
        id: anotherJobId,
        startTime: '1970-01-02T00:00:00.000Z'
      });
      const res = await chai
        .request(app.server())
        .get("/jobs?fromDate=1970-01-01T00:00:00.000Z&toDate=1970-01-01T23:59:59.000Z");
      expect(res).to.have.status(200);
      expect(res.body).to.not.containSubset([, {
        startTime: "1970-01-02T00:00:00.000Z",
        id: anotherJobId
      }]);
      expect(res.body).to.containSubset([{
        startTime: "1970-01-01T00:00:00.000Z",
        id: oneJobId
      }]);
    });


    /////////////////////////////////////////////////////////////////////////////////////////

    it("Filtering should not work with only start or with only end date", async () => {
      expect(await chai
        .request(app.server())
        .get("/jobs?fromDate=1970-01-01T00:00:00.000Z")).to.have.status(400);
      expect(await chai
        .request(app.server())
        .get("/jobs?toDate=1970-01-01T00:00:00.000Z")).to.have.status(400);
    });

    /////////////////////////////////////////////////////////////////////////////////////////

    it("Modyfing jobs collection should work", async () => {
      const oneJobId = newJobId();
      const oneJob = await insertJobAutoCompleted({
        id: oneJobId,
        startTime: '1970-01-01T00:00:00.000Z'
      });
      const modifiedJob = _.merge(oneJob, {
        id: oneJobId,
        startTime: '2018-01-01T00:00:00.000Z'
      });
      const modifyRes = await chai.request(app.server()).patch(`/jobs/${oneJobId}`).type(
        "application/json").send(
        JSON.stringify(modifiedJob)
      );
      expect(modifyRes).to.have.status(200);

      const jobsRes = await chai
        .request(app.server())
        .get("/jobs");
      expect(jobsRes).to.have.status(200);
      expect(jobsRes.body).to.containSubset([{
        startTime: "2018-01-01T00:00:00.000Z",
        id: oneJobId
      }]);
      expect(jobsRes.body).to.not.containSubset([{
        startTime: "1970-01-01T00:00:00.000Z",
        id: oneJobId
      }]);
    });

    it("Should return 404 if unexisting job is modified", async () => {
      const oneJobId = newJobId(),
        unexistingJobId = newJobId();
      const oneJob = await insertJobAutoCompleted({
        id: oneJobId,
        startTime: '1970-01-01T00:00:00.000Z'
      });
      const modifiedJob = _.merge(oneJob, {
        id: oneJobId,
        startTime: '2018-01-01T00:00:00.000Z'
      });
      const modifyRes = await chai.request(app.server()).patch(`/jobs/${unexistingJobId}`).type(
        "application/json").send(
        JSON.stringify(modifiedJob)
      );
      expect(modifyRes).to.have.status(404);

      // Make sure it was not modified.
      const jobsRes = await chai
        .request(app.server())
        .get("/jobs");
      expect(jobsRes).to.have.status(200);
      expect(jobsRes.body).to.containSubset([{
        id: oneJobId,
        startTime: '1970-01-01T00:00:00.000Z'
      }]);
      expect(jobsRes.body).to.not.containSubset([{
        id: oneJobId,
        startTime: '2018-01-01T00:00:00.000Z'
      }]);
    });

    it("Modyfing jobs collection should not allow change of id", async () => {
      const oneJobId = newJobId(),
        unexistingJobId = newJobId();
      const oneJob = await insertJobAutoCompleted({
        id: oneJobId,
        startTime: '1970-01-01T00:00:00.000Z'
      });
      const modifiedJob = _.merge(oneJob, {
        id: unexistingJobId,
        startTime: '2018-01-01T00:00:00.000Z'
      });
      const modifyRes = await chai.request(app.server()).patch(`/jobs/${oneJobId}`).type(
        "application/json").send(
        JSON.stringify(modifiedJob)
      );
      expect(modifyRes).to.have.status(400);
    });

    /////////////////////////////////////////////////////////////////////////////////////////

    // it("Updating existing job by id should work", done => {
    //   assert.isOk(false, "this will fail");
    //   done();
    // });
  }); // jobs
});