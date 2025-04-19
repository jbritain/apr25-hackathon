const { verifyToken } = require('../middleware/auth.js');

module.exports = function (app, db) {
    // we need routes to
    // - create exercise
    // - edit exercise
    // - delete exercise
    // - list exercises

    app.get("/exercises", verifyToken, function(req, res) {
        res.render("pages/exercises.njk", {
            exercises: [
                { name: "Exercise 1", id: 1 },
                { name: "Exercise 2", id: 2 },
                { name: "Exercise 3", id: 3 }
            ],
            user: req.user
        });
    });

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
