const { default: axios } = require("axios");
const fsPromise = require("fs/promises");
const shortid = require("shortid");

const ROOT = "https://api.jsonbin.io/v3";
const APIKEY = "$2b$10$ZFiUgXxIT37j9HZKTvXJkOfMRxB0OzLbyOCbiPFSr4AOca6buiMYi";
const binId = "6041f5f29342196a6a6dea23";
const headers = {
  headers: {
    "Access-Control-Allow-Origin": "*",
    "X-Master-Key": APIKEY,
    "X-Collection-Id": "6041e43d81087a6a8b96a1ab",
    "Content-Type": "application/json",
  },
};

let testOrNor;
process.env.NODE_ENV === "test"
  ? (testOrNor = "testDB")
  : (testOrNor = "database");

class DataBase {
  constructor() {
    this.dataUrl = [];

    //keep the data URL sync with the data base
    readFromBase().then(async (data) => {
      if (data) {
        this.dataUrl = data;
      }
      await getFromJsonBin()
        .then((jsonBinData) => {
          if (jsonBinData) {
            this.dataUrl = jsonBinData;
            console.log("Done to reload from json bin");
          }
        })
        .catch((e) => {
          console.log(e);
        });
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
    putToJsonBin(this.dataUrl);
    const data = JSON.stringify(this.dataUrl, null, 4);
    return fsPromise
      .writeFile(`./database/${testOrNor}.json`, data, "utf-8")
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

  // update the clicks on the redirect
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
        data = JSON.stringify(data, null, 4);
        fsPromise.writeFile(`./database/${testOrNor}.json`, data, (e) => {
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

//receive url and type, and find the match url from the data base
function compareUrlFromBase(url, kind) {
  return fsPromise
    .readFile(`./database/${testOrNor}.json`, "utf8")
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
    .readFile(`./database/${testOrNor}.json`, "utf8")
    .then((data) => {
      const parseData = JSON.parse(data);
      return parseData;
    })
    .catch((e) => {
      console.error("Can't read the data base");
      return false;
    });
}

function putToJsonBin(urlData) {
  axios
    .put(`${ROOT}/b/${binId}`, urlData, headers)
    .then((res) => {
      console.log("all good" + res);
    })
    .catch((e) => {
      console.log(e);
    });
}

function getFromJsonBin() {
  return axios
    .get(`${ROOT}/b/${binId}`, headers)
    .then((bins) => {
      return bins.data.record;
    })
    .catch((e) => {
      console.log(e);
    });
}
module.exports = { DataBase, URL, putToJsonBin, getFromJsonBin };
