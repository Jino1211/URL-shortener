const app = require("./app");
const PORT = process.env.PORT || 3000;
const axios = require("axios").default;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
