const express = require("express");
const path = require("path");

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

app.get("/scripts/canvas.js", (req, res) => {
  res.sendFile(path.join(__dirname, "canvas.js"));
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
