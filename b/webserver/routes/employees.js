const express = require("express");
const router = express.Router();

const employeeController = require("../controllers/employees");

router.get("/", employeeController.getEmployees);
router.get("/:id", employeeController.getEmployee);
router.put("/:id", employeeController.putEmployee);
router.post("/", employeeController.postEmployee);

module.exports = router;
