const employeeSchemas = require("../schemas/employees");
const validate = require("../schemas/validate");
const storage = require("../../storage");

module.exports = {
  async getEmployeesCollection() {
    const employees = storage.getEmployees();
    return new Promise((resolve, reject) => {
      if (employees) {
        resolve(employees);
      } else {
        reject("Failed to retreive employees from database");
      }
    });
  },

  async getEmployee(id) {
    validate(id, employeeSchemas.employeeId);
    return await storage.getEmployeeById(id);
  },

  async insertEmployee(employee) {
    validate(employee, employeeSchemas.employee);
    await storage.insertEmployee(employee);
    return employee.id;
  },

  async updateEmployee(id, employee) {
    validate(employee, employeeSchemas.employee);
    await storage.updateEmployeeById(id, employee);
  }
};
