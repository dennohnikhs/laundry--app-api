const express = require("express");
const router = require("./routes/index");
const app = express();
const swaggerDocs = require("./swagger");

app.use(express.json());

app.use("/", router);
const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log("Server started ....");
  swaggerDocs(app, port);
});
