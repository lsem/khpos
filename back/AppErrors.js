class InconsistentPlanDateError extends Error {
  constructor(message) {
    super(message);
  }
}
class NotImplementedError extends Error {
  constructor(what) {
    super(`${what ? what : "Method"} not implemented`);
  }
}

class NotFoundError extends Error {
  constructor(what) {
    super(`${what ? what : "entity"} not found`);
  }
}

module.exports = {
  InconsistentPlanDateError,
  NotImplementedError,
  NotFoundError,
};
