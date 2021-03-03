const { json } = require("body-parser");
const e = require("express");
const express = require("express");
const router = express.Router();
const { URL, DataBase } = require("../managedatabase");

router.use(express.json());
router.use(express.urlencoded());

//middleware check if req.url exist
function checkExist(req, res, next) {
  const { url } = req.body;
  DB.urlExists(url)
    .then((urlObject) => {
      if (urlObject) {
        res
          .status(200)
          .send(
            `Already exist. Original url: ${urlObject.originUrl} | Short url: ${urlObject.shrinkUrl}`
          );
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
      .send(
        `First time you send it. Original url: ${newUrl.originUrl} | Short url: ${newUrl.shrinkUrl}`
      );
  });
});

router.get("/:short", (req, res) => {
  const { short } = req.params;
  DB.findOriginalUrl(short).then((urlObject) => {
    console.log(urlObject);
    res.redirect(`${urlObject.originUrl}`);
  });
});

module.exports = router;
