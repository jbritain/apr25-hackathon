const express = require("express");
const nunjucks = require("nunjucks");
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("./db.sqlite3");
const { verifyToken, generateToken } = require('./middleware/auth');
const initDB = require('./init-db.js');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

require('dotenv').config();
const PORT = process.env.PORT;
const fileUpload = require('express-fileupload');

var app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload({
  // Configure file uploads with maximum file size 10MB
  limits: { fileSize: 10 * 1024 * 1024 },

  // Temporarily store uploaded files to disk, rather than buffering in memory
  useTempFiles : true,
  tempFileDir : '/tmp/'
}));

require('./routes/auth.js')(app, db);
require('./routes/exercises.js')(app, db);
require('./routes/classes.js')(app, db);

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
