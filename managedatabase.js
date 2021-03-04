const e = require("express");
const { readFile } = require("fs");
const fsPromise = require("fs/promises");
const { url } = require("inspector");
const shortid = require("shortid");

class DataBase {
  constructor() {
    this.dataUrl = [];

    //keep the URL array sync with the data base
    readFromBase().then((data) => {
      if (data) {
        this.dataUrl = data;
      }
    });
  }

  //check if the current URL is already exist in database, and return the original+shrink if yes.
  urlExists(url) {
    return compareUrlFromBase(url, "originUrl");
    //   return fsPromise
    //     .readFile("./database/database.json", "utf8")
    //     .then((data) => {
    //       const parseData = JSON.parse(data);
    //       const findUrl = parseData.find((urlElem) => {
    //         if (urlElem.originUrl === url) {
    //           return true;
    //         }
    //       });
    //       if (findUrl) {
    //         return findUrl;
    //       }
    //       throw new Error("hye hahah");
    //     })
    //     .catch((e) => {
    //       return false;
    //     });
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
    //   return fsPromise
    //     .readFile("./database/database.json", "utf8")
    //     .then((data) => {
    //       const parseData = JSON.parse(data);
    //       const findUrl = parseData.find((urlElem) => {
    //         if (urlElem.shrinkUrl === short) {
    //           return true;
    //         }
    //       });
    //       if (findUrl) {
    //         return findUrl;
    //       }
    //       throw new Error("Not found");
    //     })
    //     .catch((e) => {
    //       return false;
    //     });
    // }
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
