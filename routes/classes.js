const { verifyToken } = require('../middleware/auth.js');

module.exports = function (app, db) {
    app.get("/classes", verifyToken, async (req, res) => {
        const classMembers = await db.all("SELECT * FROM user_class WHERE userID = ?", [req.user.id]);
        console.log(classMembers);
        res.render("pages/classes.njk", {user: req.user, classes: []});
    });
}
