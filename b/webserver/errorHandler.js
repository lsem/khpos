const storageErrors = require("../storage/errors");
const appErrors = require("../application/errors");

module.exports = function errorHandler(err, req, res, next) {
  // https://www.restapitutorial.com/httpstatuscodes.html
  // WARNING: Order metters because of how catch works in regards to inheritance.
  switch (err.constructor) {
    case storageErrors.InvalidOperationError:
    case storageErrors.AlreadyExistsError:
    case appErrors.InvalidArgError:
    case appErrors.InvalidModelError:
    case appErrors.BadRequestError:
      return res.status(400).send(err.message);
    case storageErrors.EntityNotFoundError:
      return res.status(404).send(err.message);
    default:
      return res.status(500).send("Unhandled error: " + err.message);
  }
};
