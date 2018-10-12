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
      checkExpectations(await chai.request(app.server()).get("/techmaps"));
    });

  });
});