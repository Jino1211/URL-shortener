const express = require("express");
const routerS = express.Router();
const { URL, DataBase } = require("../managedatabase");
const { DB } = require("./shorturl");

routerS.get("/:short", (req, res) => {
  const { short } = req.params;
  console.log(short);
  DB.findOriginalUrl(short)
    .then((findUrl) => {
      if (!findUrl) {
        throw new Error("This short URL do not exist");
      }
      res.json(findUrl);
    })
    .catch((e) => {
      res.status(404).send(`${e}`);
    });
});
module.exports = { routerS };
