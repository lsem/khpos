process.env.NODE_ENV = "test";

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

function newTechMapId() {
  return 'TM-' + uuid.v4()
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
    await app.getApp().clearStorage()
  })

  describe("/techmaps", () => {

    it("should provide application/json content type header", done => {
      chai
        .request(app.server())
        .get("/techmaps")
        .end((err, res) => {
          expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
          done();
        });
    });

    it("should be CORS enabled", async () => {
      // TODO: https://github.com/lsem/khpos/issues/10
      const checkExpectations = (res) => {
        expect(res).to.have.header('Access-Control-Allow-Origin', '*');
        expect(res).to.have.header('Access-Control-Allow-Methods', undefined);
        expect(res).to.have.header('Access-Control-Allow-Headers', undefined);
      };
      checkExpectations(await chai.request(app.server()).get("/techmaps"));
      checkExpectations(await chai.request(app.server()).post("/techmaps"));
      checkExpectations(await chai.request(app.server()).patch("/techmaps"));
    });

    it("should return 404 if unexisting job is requested", async () => {
      const res = await chai.request(app.server()).get(`/techmaps/${newTechMapId()}`);
      expect(res).to.have.status(404);
    });

    it.skip("should bump up version when modified techmap put", async() => {
      // todo: make sure all fields are checked.
    });

    it.skip("should not bump up version when unmodified techmap put", async() => {
      // todo: consider returning error or some not-modified for this case,
      // or emit warning at least, since it looks like clients logic error.
    });

    it.skip("should be able to return latest version by special name id", async() => {
      // todo: test /techmaps/TM-XXXX-YYYY-ZZZZ-QQQQ/HEAD
    });

    it.skip("newly inserted techmap should be availavle in collection", async() => {
      // todo: test get /techmaps/
    });

    it.skip("getting techmap without version specified should return collection of all versions", async() => {
      // todo: teset get /techmaps/TM-XXXX-YYYY-ZZZZ-QQQQ
    });

  });
});