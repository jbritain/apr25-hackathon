const express = require("express");
const nunjucks = require("nunjucks");
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("./db.sqlite3");
const { verifyToken, generateToken } = require('./middleware/auth');
const initDB = require('./init-db.js');

require('dotenv').config();
const PORT = process.env.PORT;

var app = express();
app.use(express.static("public"));

var env = nunjucks.configure("views", {
  autoescape: true,
  express: app
});

app.get("/", (req, res) => {
    try {
        res.render("pages/index.njk");
    } catch(e) {
        console.error(e);
    }
})

initDB(db);

app.listen(PORT || 8080, () => {
  console.log(`Listening at http://localhost:${PORT || 8080}`);
})
