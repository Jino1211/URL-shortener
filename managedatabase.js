const fs = require("fs");
const shortid = require("shortid");

class DataBase {
  constructor() {}

  checkIfUrlExists(URL) {
    fs.readFile("./database/database.json", "utf8", (err, data) => {
      if (err) {
        return false;
      }
    });
  }
  getUrl(url) {
    if (!this.checkIfUrlExists(url)) {
      return false;
    }
  }

  update(updateData) {}
}

class URL {
  constructor(URL) {
    this.url = URL;
  }

  shrinkingUrl() {
    this.shrinkUrl = shortid.generate();
  }
}
