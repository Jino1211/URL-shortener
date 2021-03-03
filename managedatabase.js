const fsPromise = require("fs/promises");
const { url } = require("inspector");
const shortid = require("shortid");

class DataBase {
  constructor() {
    this.dataUrl = [];
  }

  //check if the current url is already exist in database, return false if not, and the original+shrink if yes.
  checkIfUrlExists(url) {
    // const data = getTheJsonBase();
    for (let urlObj in data) {
      if (url === urlObj[originUrl]) {
        return urlObj;
      }
    }
    return false;
  }

  addURL(url) {
    // if (this.checkIfUrlExists(url)) {
    // return false;
    // }
    const newUrl = new URL(url);
    this.dataUrl.push(newUrl);
    console.log(this.dataUrl);
    const data = JSON.stringify(this.dataUrl);
    fsPromise
      .writeFile("./database/database.json", data, "utf-8")
      .then(() => {
        console.log("Success :" + data);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

class URL {
  constructor(URL) {
    this.originUrl = URL;
    this.shrinkUrl = shortid.generate();
    this.createAt = new Date();
  }
}

// function getTheJsonBase() {
//   fs.readFile("./database/database.json", "utf8").then((data) => {
//     data = JSON.stringify(data);
//     console.log(data);
//   });
//   if (err) {
//     console.error("Cannot able to read the database:" + err);
//   }
//   try {
//   } catch {
//     console.error("Cannot able to parse the data:" + err);
//   }
// }

module.exports = { DataBase, URL };
