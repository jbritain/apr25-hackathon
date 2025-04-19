const { verifyToken } = require('../middleware/auth.js');

module.exports = function (app, db) {
    app.get("/classes", verifyToken, async (req, res) => {
        try {
            const rows = await new Promise((resolve, reject) => {
                db.all("SELECT * FROM user_class WHERE userID = ?", [req.user.id], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });

            const classPromises = rows.map(row => {
                return new Promise((resolve, reject) => {
                    db.get("SELECT * FROM class WHERE classCode = ?", [row.classCode], (err, classData) => {
                        if (err) reject(err);
                        else resolve(classData);
                    });
                });
            });

            const classes = await Promise.all(classPromises);
            res.render("pages/classes.njk", {user: req.user, classes: classes});
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    });

    app.post("/classes/create", verifyToken, async (req, res) => {
        const className = req.body['class-name'];
        let classCode = req.body['class-code'];
        await db.run("INSERT INTO class (className, classCode) VALUES (?, ?)", [className, classCode]);
        await db.run("INSERT INTO user_class (userID, classCode) VALUES (?, ?)", [req.user.id, classCode]);
        res.redirect("/classes");
    });

    app.post("/classes/join", verifyToken, async (req, res) => {
        const classCode = req.body['class-code'];
        await db.run("INSERT INTO user_class (userID, classCode) VALUES (?, ?)", [req.user.id, classCode]);
        res.redirect("/classes");
    });
}
