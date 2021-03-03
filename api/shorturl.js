const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const { URL, DataBase } = require("../managedatabase");

router.use(express.json());
router.use(express.urlencoded());

const DB = new DataBase();

router.post("/", (req, res) => {
  DB.addURL(req.body.url);

  res.status(200).json({
    msg: `"origin Url:",
      "short Url:"
      "success"`,
  });
  // res.send("Url excised");
});

module.exports = router;
