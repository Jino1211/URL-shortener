const { json } = require("body-parser");
const e = require("express");
const express = require("express");
const router = express.Router();
const { URL, DataBase } = require("../managedatabase");

router.use(express.json());
router.use(express.urlencoded());

//check if req.url exist
function checkExist(req, res, next) {
  const { url } = req.body;
  DB.urlExists(url)
    .then((excisedUrl) => {
      if (excisedUrl) {
        res.send(excisedUrl);
        return;
      }
      throw new Error(e);
    })
    .catch((e) => {
      next();
    });
}

const DB = new DataBase();

router.post("/", checkExist, (req, res) => {
  const { url } = req.body;

  console.log("newUrl");
  DB.addURL(url).then((newUrl) => {
    res
      .status(200)
      .send(`original url: ${newUrl.originUrl} short url: ${newUrl.shrinkUrl}`);
  });
});
// res.send("Url excised");

module.exports = router;
