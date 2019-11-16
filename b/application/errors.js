class AppError extends Error {
  constructor(what) {
    super(`Storage error: ${what}`);
  }
}

class BadRequestError extends AppError {
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
    super(`Invalid model. Details: ${what}`);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  InvalidArgError,
  InvalidModelError
};
