const joi = require("joi");
const prefixedUuidRegExp = require("../helpers/prefixedUuidRegExp");

const employeeIdRegExp = new RegExp(prefixedUuidRegExp("EMP"), "i");

const employeeId = joi
  .string()
  .regex(employeeIdRegExp)
  .required();

const employee = joi.object().keys({
  id: employeeId,
  firstName: joi.string().required(),
  color: joi.string().required()
});

module.exports = { employeeId, employee };
