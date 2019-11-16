const cors = require("cors");
const express = require("express");
const morgan = require("morgan");


const routes = require("./routes");
const errorHandler = require("./errorHandler");

const server = express();
server.use(cors());
server.use(morgan(process.env.NODE_ENV === "dev" ? "dev" : "common"));
server.use(express.json());

server.use("/employees", routes.employeesRoutes);

server.use(errorHandler);

module.exports = server;
