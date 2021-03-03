const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded());

router.post("/", (req, res) => {
  let { url } = req.body;
  res.status(302).json({ msg: "origin Url: " + url });
});

module.exports = router;
