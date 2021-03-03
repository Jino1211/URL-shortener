const { Router } = require("express");
const shorturl = require("./shorturl");
const statics = require("./statics");

const api = Router();

api.use("/shorturl", shorturl);
api.use("/statics", statics);
api.use("*", (req, res) => {
  res.status(404).send({ msg: "Page Not Found" });
});

module.exports = api;
