const request = require("supertest");
const { DB } = require("./api/shorturl");
const { getFromJsonBin } = require("./managedatabase");
const resStatistics =
  '<!DOCTYPE html><html lang="en"><head><link rel="stylesheet" href="../../public/style.css"><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>statistics </title></head><body><h1>STATISTICS </h1><table> <tr> <th>Original Url </th><th>Short Url </th><th>Date</th><th>Redirect count </th></tr><tr> <td>https://www.google.com/</td><td>guJAIH63m</td><td>05/03/2021, 9:30:54</td><td>1</td></tr></table></body></html>';
urlObjForTest = [
  {
    originUrl: "https://www.google.com/",
    shrinkUrl: "guJAIH63m",
    createAt: "05/03/2021, 9:30:54",
    redirectCounter: 0,
  },
];

const fsPromise = require("fs/promises");

const app = require("./app");

beforeAll(async () => {
  await fsPromise.writeFile(
    `./database/testDB.json`,
    JSON.stringify(urlObjForTest, null, 4),
    (e) => {
      console.log(e);
    }
  );
  DB.keepMeSync();
});

describe("POST test", () => {
  const validUrl = { url: "https://github.com/Jino1211/URL-shortener" };
  const validWithShort = {
    url: "https://www.youtube.com/watch?v=g2nMKzhkvxw",
    short: "jino",
  };
  const existUrl = { url: "https://www.google.com/" };
  const inValidUrl = { url: "inValidUrl" };
  const invalidError = "Error: This is invalid URL";

  it("Should get valid URL and added it to the DB", async () => {
    const length = DB.dataUrl.length;
    const res = await request(app).post("/api/shorturl").send(validUrl);

    expect(res.status).toBe(201);
    expect(DB.dataUrl.length).toBeGreaterThan(length);
  });

  it("Should get an exist URL and return url obj with all details", async () => {
    const length = DB.dataUrl.length;
    const res = await request(app).post(`/api/shorturl`).send(existUrl);

    expect(res.status).toBe(200);
    expect(DB.dataUrl.length).toBe(length);
  });

  it("Should get invalid URL and response ERROR invalid", async () => {
    const res = await request(app).post("/api/shorturl").send(inValidUrl);

    expect(res.status).toBe(400);
    expect(`${res.body}`).toEqual(`${invalidError}`);
  });

  it("Should get url and costume short and receive the costume url short", async () => {
    const res = await request(app).post("/api/shorturl").send(validWithShort);

    expect(res.text).toBe(
      "First time you send it. Original url: https://www.youtube.com/watch?v=g2nMKzhkvxw | Short url: jino"
    );
  });

  it("Should get new url and new costume short that already exist and return different short", async () => {
    const res = await request(app).post("/api/shorturl").send({
      url: "https://jsonbin.io/collections/6041e43d81087a6a8b96a1ab",
      short: "jino",
    });

    expect(res.text).not.toBe(
      "First time you send it. Original url: https://jsonbin.io/collections/6041e43d81087a6a8b96a1ab | Short url: jino"
    );
  });

  it("Should get new url and costume that already exist and return error", async () => {
    const res = await request(app).post("/api/shorturl").send({
      url: "https://www.youtube.com/watch?v=g2nadMKzhkvxw",
      short: "jino",
    });

    expect(res.text).toBe(
      '{"ERROR":"This short is already exist please choose different name"}'
    );
  });
});

describe("GET test", () => {
  it("Should get short url and redirect to original src", async () => {
    const res = await request(app).get("/api/shorturl/guJAIH63m");

    expect(res.status).toBe(302);
    expect(res.header.location).toBe("https://www.google.com/");
  });

  it("Should get short url that does not exist and receive an Error", async () => {
    const res = await request(app).get("/api/shorturl/ySWqy3aysh");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ ERROR: "Error: Short url is not found" });
  });

  it("Should get short url that is not in the format", async () => {
    const res = await request(app).get("/api/shorturl/ySWqy3ayshfdsdssf");

    expect(res.status).toBe(400);
    expect(res.body).toBe("Error: Not in format");
  });

  it("Counter should increase by one for each click on short link", async () => {
    const res = await request(app).get("/api/shorturl/guJAIH63m");
    const thisUrl = DB.dataUrl.find((elem) => {
      if (elem.shrinkUrl === "guJAIH63m") {
        return true;
      }
    });
    expect(thisUrl.redirectCounter).toBe(1);
  });
});

describe("Statistics test", () => {
  it("Should get sort url and received his obj", async () => {
    const res = await request(app).get("/api/statistics/guJAIH63m");

    expect(res.text).toBe(resStatistics);
  });
});
