import * as errors from "app/errors";
import {assert} from "chai";
import {mapErrorToHTTP} from "webMain";

describe("[webMain]", () => {
  it("shoudl map errors to http properly", () => {
    assert.equal(mapErrorToHTTP(new errors.NotFoundError()), 404);
    assert.equal(mapErrorToHTTP(new errors.InvalidCredentialsError()), 401);
    assert.equal(mapErrorToHTTP(new errors.AuthorizationError()), 401);
    assert.equal(mapErrorToHTTP(new errors.NeedsAdminError()), 401);
    assert.equal(mapErrorToHTTP(new errors.NotAllowedError()), 401);
    assert.equal(mapErrorToHTTP(new errors.AlreadyExistsError()), 409);
    assert.equal(mapErrorToHTTP(new errors.ValidationError()), 400);
    assert.equal(mapErrorToHTTP(new errors.InvalidOperationError()), 400);
    assert.equal(mapErrorToHTTP(new errors.BadArgsError()), 400);
    assert.equal(mapErrorToHTTP(new Error()), 501);
  });
});
