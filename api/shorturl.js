// const { json } = require("body-parser");
const e = require("express");
const express = require("express");
const router = express.Router();
const { URL, DataBase } = require("../managedatabase");
const validUrl = require("valid-url");

router.use(express.json());
router.use(express.urlencoded());

//middleware check if req.url exist in post request
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

//middleware that check short format is valid - 9 characters
function checkFormat(req, res, next) {
  const { short } = req.params;
  if (short.length >= 11) {
    res.status(400).json(`${new Error("Not in format")}`);
    return;
  }
  next();
}

const DB = new DataBase();
DB.keepMeSync();

router.post("/", checkExist, (req, res) => {
  const { url } = req.body;
  const { short } = req.body;
  let costume = false;

  if (!validUrl.isUri(url)) {
    res.status(400).json(`${new Error("This is invalid URL")}`);
    return;
  }
  if (short) {
    costume = true;
  }
  console.log("newUrl");
  DB.addURL(url, costume, short)
    .then((newUrl) => {
      res
        .status(201)
        .send(
          `First time you send it. Original url: ${newUrl.originUrl} | Short url: ${newUrl.shrinkUrl}`
        );
    })
    .catch((e) => {
      console.log(e);
      res.status(500).send(`${e}`);
    });
});

router.get("/:short", checkFormat, (req, res) => {
  const { short } = req.params;
  DB.findOriginalUrl(short)
    .then((urlObject) => {
      if (!urlObject) {
        res
          .status(404)
          .json({ ERROR: `${new Error("Short url is not found")}` });
        return;
      }
      DB.updateRedirectClicks(short);
      res.status(302).redirect(`${urlObject.originUrl}`);
    })
    .catch((e) => {
      res.status(500).send(`${e}`);
    });
});

module.exports = { router, DB };
