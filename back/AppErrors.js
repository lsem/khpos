class KhApplicationError extends Error {
  constructor(what) {
    super('KhApplicationError: ' + what)
  }
};

class StorageError extends KhApplicationError {
  constructor(what) {
    super(`Storage error: ${what}`)
  }
}

class NotImplementedError extends KhApplicationError {
  constructor(what) {
    super(`${what ? what : "Requested method"} is not implemented`);
  }
}

class NotFoundError extends KhApplicationError {
  constructor(what) {
    super(`${what ? what : "entity"} not found`);
  }
}

class PlanError extends KhApplicationError {
  constructor(what) {
    super('Plan Error: ' + what)
  }
};

class InvalidOperationError extends KhApplicationError {
  constructor(which) {
    super(`Invalid operation ${which ? ": " + which : ""}`);
  }
}

class BadRequestError extends KhApplicationError {
  constructor(message) {
    super(message);
  }
}

class InvalidArgError extends BadRequestError {
  constructor(argName, argValue) {
    let message;
    if (argName && argValue) {
      message = `'${argValue}' is not valid value for argument '${argName}'`;
    } else if (argName) {
      message = `${argName} argument value is not valid`;
    } else {
      message = `argument is invalid`;
    }
    super(message);
  }
}

class InvalidModelError extends BadRequestError {
  constructor(what) {
    super(`Invalid model. Details: ${what}`)
  }
}


module.exports = {
  KhApplicationError,
  NotImplementedError,
  NotFoundError,
  PlanError,
  InvalidModelError,
  StorageError,
  InvalidOperationError,
  BadRequestError,
  InvalidArgError,
};