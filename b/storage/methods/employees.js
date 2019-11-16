const errors = require("../errors");
const mongo = require("../mongo");

module.exports = {
  async getEmployees() {
    return await mongo.db
      .collection("employees")
      .find(
        {},
        {
          projection: {
            _id: false
          }
        }
      )
      .toArray();
  },

  async insertEmployee(employee) {
    try {
      await mongo.db.collection("employees").insertOne(employee);
    } catch (e) {
      if (e.code === 11000) {
        throw new errors.AlreadyExistsError(employee.id);
      } else {
        throw e;
      }
    }
  },

  async getEmployeeById(id) {
    const staffEntry = await mongo.db.collection("employees").findOne(
      {
        id: id
      },
      {
        projection: {
          _id: false
        }
      }
    );
    if (!staffEntry) {
      throw new errors.EntityNotFoundError(`Employee ${id}`);
    }
    return staffEntry;
  },

  async updateEmployeeById(id, model) {
    const existingModel = await mongo.db.collection("employees").findOne({
      id: id
    });
    if (!existingModel) {
      throw new errors.EntityNotFoundError(`Employee ${id}`);
    }
    if (existingModel.id !== model.id) {
      throw new errors.InvalidOperationError(
        `Employee modification is not allowed: ${existingModel.id} != ${model.id}`
      );
    }
    return await mongo.db.collection("employees").replaceOne(
      {
        id: id
      },
      model
    );
  }
};
