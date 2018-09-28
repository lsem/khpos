class KhApplicationError extends Error {
  constructor(what) {
    super('KhApplicationError: ' + what)
  }
};

class InvalidModelError extends KhApplicationError {
  constructor(what) {
    super(`Invalid model. Details: ${what}`)
  }
}

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

module.exports = {
  KhApplicationError,
  NotImplementedError,
  NotFoundError,
  PlanError,
  InvalidModelError,
  StorageError
};
