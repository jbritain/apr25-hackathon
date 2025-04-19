const express = require("express");
const nunjucks = require("nunjucks");

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

app.listen(PORT || 8080, () => {
  console.log(`Listening at http://localhost:${PORT || 8080}`);
})
