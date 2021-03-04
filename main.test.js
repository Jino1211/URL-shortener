const request = require("supertest");
const { DB } = require("./api/shorturl");

const fsPromise = require("fs/promises");

const app = require("./app");

describe("POST test", () => {
  const validUrl = { url: "https://github.com/Jino1211/URL-shortener" };
  const existUrl = { url: "https://www.google.com/" };
  const inValidUrl = { url: "inValidUrl" };
  const invalidError = "Error: This is invalid URL";

  it("Should get valid URL and return url obj with all details", async () => {
    const length = DB.dataUrl.length;
    const res = await request(app).post("/api/shorturl").send(validUrl);

    expect(res.status).toBe(201);
    expect(DB.dataUrl.length).not.toBe(length);
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
});

describe("GET test", () => {
  it("Should get short url and redirect to original src", async () => {
    const res = await request(app).get("/api/shorturl/6u2EqhsdU");

    expect(res.status).toBe(302);
    expect(res.header.location).toBe("https://www.google.com/");
  });

  it("Should get short url that does not exist and receive an Error", async () => {
    const res = await request(app).get("/api/shorturl/ySWqy3aysh");

    expect(res.status).toBe(404);
    // expect(res.body.text).toEqual();
  });

  it("Should get short url that is not in the format", async () => {
    const res = await request(app).get("/api/shorturl/ySWqy3ayshfdsdssf");

    expect(res.status).toBe(400);
    expect(res.body).toBe("Error: Not in format");
  });

  //   it("Counter should increase by one for each click on short link", async () => {
  //     const counterBefore = DB.dataUrl[index].redirectCounter;
  //     const res = await request(app).get("/api/shortUrl/6u2EqhsdU");

  //     const counterAfter = DB.dataUrl[index].redirectCounter;
  //     expect(counterAfter).not.toBe(counterBefore);
  //   });
});

// describe("Statistics test", () => {
//   it("Should get sort url and received his obj", async () => {
//     const res = await request(app).get("/api/statistics/6u2EqhsdU");
//     const thisUrl = DB.dataUrl.find((elem) => {
//       if (elem.shrinkUrl === "6u2EqhsdU") {
//         return true;
//       }
//     });
//     expect(res.body).not.toEqual(thisUrl.redirectCounter);
//   });
// });
