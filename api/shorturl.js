// const { json } = require("body-parser");
const e = require("express");
const express = require("express");
const router = express.Router();
const { URL, DataBase } = require("../managedatabase");
const validUrl = require("valid-url");

router.use(express.json());
router.use(express.urlencoded());

//middleware check if req.url exist in post request
async function checkExist(req, res, next) {
  const { url } = req.body;
  try {
    const urlObject = await DB.findUrlFromBase(url, "originUrl");
    console.log(urlObject);
    res
      .status(200)
      .send(
        `Already exist. Original url: ${urlObject.originUrl} | Short url: ${urlObject.shrinkUrl}`
      );
  } catch (e) {
    console.log("here");
    next();
  }
}

//middleware that check short format is valid - 9 characters
function checkFormat(req, res, next) {
  const { shortUrl } = req.params;
  if (shortUrl.length >= 11) {
    res.status(400).json(`${new Error("Not in format")}`);
    return;
  }
  next();
}

function checkShortExist(req, res, next) {
  const { short } = req.body;
  DB.findUrlFromBase(short, "shrinkUrl")
    .then((data) => {
      res.status(409).json({
        ERROR: "This short is already exist please choose different name",
      });
    })
    .catch((e) => next());
}

const DB = new DataBase();
DB.syncDB();

// Create new shortUrl route
router.post("/", checkExist, checkShortExist, (req, res) => {
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

router.get("/:shortUrl", checkFormat, async (req, res) => {
  const { shortUrl } = req.params;
  try {
    const urlObject = await DB.findUrlFromBase(shortUrl, "shrinkUrl");
    console.log("here" + urlObject);
    DB.updateRedirectClicks(shortUrl);
    res.status(302).redirect(`${urlObject.originUrl}`);
  } catch (e) {
    res.status(404).json({ ERROR: "short Url is not found" });
  }
});

module.exports = { router, DB };
