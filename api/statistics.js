const express = require("express");
const routerS = express.Router();
const { URL, DataBase, getFromJsonBin } = require("../managedatabase");
const { DB } = require("./shorturl");

routerS.get("/:short", (req, res) => {
  const { short } = req.params;
  console.log(short);
  DB.findUrlFromBase(short, "shrinkUrl")
    .then((findUrl) => {
      if (!findUrl) {
        throw new Error("This short URL do not exist");
      }
      const url = [];
      url.push(findUrl);
      res.status(200).render("statistics", { urls: url });
    })
    .catch((e) => {
      res.status(404).send(`${e}`);
    });
});

routerS.get("/", (req, res) => {
  getFromJsonBin().then((url) => {
    res.status(200).render("statistics", { urls: url });
  });
});

module.exports = { routerS };
