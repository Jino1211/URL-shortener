const e = require("express");
const fsPromise = require("fs/promises");
const { url } = require("inspector");
const shortid = require("shortid");

class DataBase {
  constructor() {
    this.dataUrl = [];
  }

  //check if the current url is already exist in database, and return the original+shrink if yes.
  urlExists(url) {
    return fsPromise
      .readFile("./database/database.json", "utf8")
      .then((data) => {
        const parseData = JSON.parse(data);
        const findUrl = parseData.find((urlElem) => {
          if (urlElem.originUrl === url) {
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

  findOriginalUrl(short) {
    return fsPromise
      .readFile("./database/database.json", "utf8")
      .then((data) => {
        const parseData = JSON.parse(data);
        const findUrl = parseData.find((urlElem) => {
          if (urlElem.shrinkUrl === short) {
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
}

class URL {
  constructor(URL) {
    this.originUrl = URL;
    this.shrinkUrl = shortid.generate();
    this.createAt = new Date().toLocaleString();
    this.redirect = 0;
  }
}

module.exports = { DataBase, URL };
