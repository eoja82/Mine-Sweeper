require('dotenv').config();
const express = require("express");
const helmet = require("helmet");

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());

app.use("/public", express.static(process.cwd() + "/public"));

app.route("/")
  .get(function (req, res) {
    res.sendFile(process.cwd() + "/views/index.html");
  })

app.route("/createaccount")
  .get(function (req, res) {
    res.sendFile(process.cwd() + "/views/createAccount.html");
  })

//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type("text")
    .send("Not Found");
});
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
}); 