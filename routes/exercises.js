const { verifyToken } = require('../middleware/auth.js');

module.exports = function (app, db) {
    // we need routes to
    // - create exercise
    // - edit exercise
    // - delete exercise
    // - list exercises

    app.get("/exercises", verifyToken, async function(req, res) {
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

        res.render("pages/exercises.njk", {
            exercises: [
                { name: "Exercise 1", id: 1 },
                { name: "Exercise 2", id: 2 },
                { name: "Exercise 3", id: 3 }
            ],
            classes : classes,
            user: req.user
        });
    });

    app.post("/exercises/create", verifyToken, function(req, res) {
        const exercise = {
            name: req.body.name,
            pointValue: req.body.pointValue,
            incentive: req.body.incentive,
            classCode: req.body.classCode
        };
        db.run("INSERT INTO exercise (name, pointValue, incentive, classCode) VALUES (?, ?, ?, ?)", [exercise.name, exercise.pointValue, exercise.incentive, exercise.classCode], function(err) {
            if (err) {
                console.error(err);
                res.status(500).send("Error creating exercise");
            } else {
                res.redirect("/exercises");
            }
        });
    })

    app.get("/exercises/:id", verifyToken, function(req, res) {
        const exerciseID = req.params.id;

        db.all("SELECT * FROM question;", [], (err, questions) => {
            
            res.render("pages/exercise.njk", {
                user:req.user,
                exercise: exerciseID,
                questions: questions
            });

            console.log(questions);
        });

    });

}
