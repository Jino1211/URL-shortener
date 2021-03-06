const { Router } = require("express");
const { router } = require("./shorturl");
const { routerS } = require("./statistics");

const api = Router();

api.use("/shorturl", router);
api.use("/statistics", routerS);

api.use("*", (req, res) => {
  res.status(404).send({ msg: "Page Not Found" });
});

module.exports = api;
