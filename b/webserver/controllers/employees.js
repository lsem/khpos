const app = require("../../application");

module.exports = {
  getEmployees(req, res, next) {
    app
      .getEmployeesCollection()
      .then(data => res.send(data))
      .catch(err => next(err));
  },

  putEmployee(req, res, next) {
    app
      .updateEmployee(req.params.id, req.body)
      .then(() => res.status(200).send())
      .catch(err => next(err));
  },

  getEmployee(req, res, next) {
    app
      .getEmployee(req.params.id)
      .then(data => res.send(data))
      .catch(err => next(err));
  },

  postEmployee(req, res, next) {
    app
      .insertEmployee(req.body)
      .then(data => res.send(data))
      .catch(err => next(err));
  }
};
