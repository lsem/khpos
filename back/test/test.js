process.env.NODE_NV = "test";
if (!process.env.POSTER_API_LINK || !process.env.POSTER_SECURITY_TOKEN) {
  throw new Error("No POSTER_API_LINK/POSTER_SECURITY_TOKEN env variable set");
}

const KhPosNodeTestApp = require("../KhPosNodeTestApp");
const chai = require("chai");
var expect = require("chai").expect;
var assert = require("chai").assert;
var should = require("chai").should;

const chaiHttp = require("chai-http");

chai.use(chaiHttp);

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
    it("should be JSON and return 200 OK", done => {
      chai
        .request(app.server())
        .get("/jobs")
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.type).to.equal("application/json")
          done();
        });
    });

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
          expect(res).to.have.header('Access-Control-Allow-Origin', '*');
          expect(res).to.have.header('Access-Control-Allow-Methods', undefined);
          expect(res).to.have.header('Access-Control-Allow-Headers', undefined);
        });
      done();
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
