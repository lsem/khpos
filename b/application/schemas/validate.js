const joi = require("joi");
const { InvalidModelError } = require("../errors");

module.exports = function(model, schema) {
  const result = joi.validate(model, schema);

  if (result.error) {
    throw new InvalidModelError(model);
  }
};
