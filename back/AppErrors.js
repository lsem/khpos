class NotImplementedError extends Error {
  constructor(what) {
    super(`${what ? what : "Requested method"} is not implemented`);
  }
}

class NotFoundError extends Error {
  constructor(what) {
    super(`${what ? what : "entity"} not found`);
  }
}

module.exports = {
  NotImplementedError,
  NotFoundError,
};
