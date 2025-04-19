const express = require("express");
const nunjucks = require("nunjucks");
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("./db.sqlite3");
const { verifyToken, generateToken } = require('./middleware/auth');
const initDB = require('./init-db.js');
const bodyParser = require('body-parser');
//const cookieParser = require('cookie-parser');

require('dotenv').config();
const PORT = process.env.PORT;

var app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(cookieParser());

require('./routes/auth.js')(app, db);

var env = nunjucks.configure("views", {
  autoescape: true,
  express: app
});

app.get("/", verifyToken, (req, res) => {
    try {
        res.render("pages/index.njk", {user: req.user});
    } catch(e) {
        console.error(e);
    }
})

initDB(db);

app.listen(PORT || 8080, () => {
  console.log(`Listening at http://localhost:${PORT || 8080}`);
})
