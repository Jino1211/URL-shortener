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
  jsonFileLocation;
  dataUrl = [];

  constructor() {}

  // sync in-memory data with local database (json file) and remote database (json bin service)
  async syncDB() {
    try {
      this.dataUrl = await readFromBase();
    } catch {
      try {
        const jsonBinData = await getFromJsonBin();
        if (jsonBinData) {
          this.dataUrl = jsonBinData;
          console.log("Done to reload from json bin");
        }
      } catch (e) {
        throw new Error("cant read from db");
      }
    }
  }

  //check if the current URL is already exist in database, and return the original+shrink if yes.

  //add url
  addURL(url, costume, short) {
    const newUrl = new URL(url, costume, short);
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
        throw new Error("Was an error" + err);
      });
  }

  // Check the current short URL and send it the source match
  findUrlFromBase(url, kind) {
    return fsPromise
      .readFile(`./database/${testOrNor}.json`, "utf8")
      .then((data) => {
        const parseData = JSON.parse(data);
        const findUrl = parseData.find((urlElem) => urlElem[kind] === url);
        if (findUrl) {
          return findUrl;
        }
        throw new Error("Not found");
      });
  }

  // update the clicks on the redirect
  updateRedirectClicks(short) {
    this.findUrlFromBase(short, "shrinkUrl")
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
        putToJsonBin(data);
        data = JSON.stringify(data, null, 4);
        fsPromise.writeFile(`./database/${testOrNor}.json`, data, (e) => {
          console.log(e);
        });
      });
  }
}

class URL {
  constructor(URL, costume, short) {
    this.originUrl = URL;
    costume === true
      ? (this.shrinkUrl = short)
      : (this.shrinkUrl = shortid.generate());
    this.createAt = new Date().toLocaleString();
    this.redirectCounter = 0;
  }
}

//receive url and type, and find the match url from the data base

//read data from local data base
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

//update data to json bin for persistence
function putToJsonBin(urlData) {
  axios
    .put(`${ROOT}/b/${binId}`, urlData, headers)
    .then((res) => {
      console.log("Success: " + res.status);
    })
    .catch((e) => {
      console.log(e);
    });
}

//get data from json bin
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

//option to clear the jsonBin, remove the comment to make it play

// (function clearJsonBin() {
//   putToJsonBin([
//     {
//       originUrl: "https://www.google.com/",
//       shrinkUrl: "guJAIH63m",
//       createAt: "05/03/2021, 9:30:54",
//       redirectCounter: 0,
//     },
//   ]);
// })();
module.exports = { DataBase, URL, putToJsonBin, getFromJsonBin };
