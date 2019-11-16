class StorageError extends Error {
  constructor(what) {
    super(`Storage error: ${what}`);
  }
}

class AlreadyExistsError extends StorageError {
  constructor(what) {
    super(`Object already exists: ${what}`);
  }
}

class EntityNotFoundError extends StorageError {
  constructor(what) {
    super(`${what ? what : "entity"} not found`);
  }
}

class InvalidOperationError extends StorageError {
  constructor(which) {
    super(`Invalid operation ${which ? ": " + which : ""}`);
  }
}

module.exports = {
  StorageError,
  AlreadyExistsError,
  EntityNotFoundError,
  InvalidOperationError
};
