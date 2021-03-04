const e = require("express");
const { readFile, read, writeFile } = require("fs");
const fsPromise = require("fs/promises");
const { url } = require("inspector");
const shortid = require("shortid");

class DataBase {
  constructor() {
    this.dataUrl = [];

    //keep the data URL sync with the data base
    readFromBase().then((data) => {
      if (data) {
        this.dataUrl = data;
      }
    });
  }

  //check if the current URL is already exist in database, and return the original+shrink if yes.
  urlExists(url) {
    return compareUrlFromBase(url, "originUrl");
  }

  //add url
  addURL(url) {
    const newUrl = new URL(url);
    this.dataUrl.push(newUrl);
    const data = JSON.stringify(this.dataUrl, null, 4);
    return fsPromise
      .writeFile("./database/database.json", data, "utf-8")
      .then(() => {
        return newUrl;
      })
      .catch((err) => {
        console.log(err);
        return "Was an error" + err;
      });
  }

  // Check the current short URL and send it the source match
  findOriginalUrl(short) {
    return compareUrlFromBase(short, "shrinkUrl");
  }

  updateRedirectClicks(short) {
    compareUrlFromBase(short, "shrinkUrl")
      .then((findUrl) => {
        const index = this.dataUrl.findIndex((matchUrlInDB) => {
          if (matchUrlInDB.shrinkUrl === findUrl.shrinkUrl) {
            return true;
          }
        });
        this.dataUrl[index].redirectCounter++;
        return this.dataUrl;
      })
      .then((data) => {
        console.log(`hello its me ${data}`);
        data = JSON.stringify(data, null, 4);
        fsPromise.writeFile("./database/database.json", data, (e) => {
          console.log(e);
        });
      });
  }
}

class URL {
  constructor(URL) {
    this.originUrl = URL;
    this.shrinkUrl = shortid.generate();
    this.createAt = new Date().toLocaleString();
    this.redirectCounter = 0;
  }
}

function compareUrlFromBase(url, kind) {
  return fsPromise
    .readFile("./database/database.json", "utf8")
    .then((data) => {
      const parseData = JSON.parse(data);
      const findUrl = parseData.find((urlElem) => {
        if (urlElem[kind] === url) {
          return true;
        }
      });
      if (findUrl) {
        return findUrl;
      }
      throw new Error("hye hahah");
    })
    .catch((e) => {
      return false;
    });
}

function readFromBase() {
  return fsPromise
    .readFile("./database/database.json", "utf8")
    .then((data) => {
      const parseData = JSON.parse(data);
      return parseData;
    })
    .catch((e) => {
      console.error("Can't read the data base");
      return false;
    });
}
module.exports = { DataBase, URL };
