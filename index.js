const express = require("express");
const nunjucks = require("nunjucks");
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("./db.sqlite3");
const { verifyToken, generateToken } = require('./middleware/auth');

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

uni.serialize(() => {
  uni.run(`
      CREATE TABLE IF NOT EXISTS user (
          name TEXT NOT NULL,
          isTeacher BOOLEAN NOT NULL,
          password TEXT NOT NULL
      )`
)});

app.listen(PORT || 8080, () => {
  console.log(`Listening at http://localhost:${PORT || 8080}`);
})
