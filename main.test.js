const request = require("supertest");

const inValidFormat = { url: "asddaxcsaasd" };
const invalidError = "Error: This is invalid URL";
const inFormatError = { Error: "" };

const fsPromise = require("fs/promises");

const app = require("./app");

describe("POST test", () => {
  const validUrl = { url: "https://github.com/Jino1211/URL-shortener" };
  const existUrl = { url: "https://www.google.com/" };
  const inValidUrl = { url: "inValidUrl" };

  it("Should get valid URL and return url obj with all details", async () => {
    const res = await request(app).post("/api/shorturl").send(validUrl);

    expect(res.status).toBe(201);
    // expect(res.body).toEqual()
  });

  it("Should get an exist URL and return url obj with all details", async () => {
    const res = await request(app).post(`/api/shorturl`).send(existUrl);

    expect(res.status).toBe(200);
    // expect(res.body).toEqual()
  });

  it("Should get invalid URL and response ERROR invalid", async () => {
    const res = await request(app).post("/api/shorturl").send(inValidUrl);

    console.log(res.body);
    expect(res.status).toBe(400);
    expect(res.body).toEqual(`${invalidError}`);
  });
});

describe("GET test", () => {
  it("Should get short url and redirect to original src", async () => {
    const res = await request(app).get("/api/shorturl/vjwPnAr-T");
  });
});
