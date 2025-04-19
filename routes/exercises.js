module.exports = function (app, db) {
    // we need routes to
    // - create exercise
    // - edit exercise
    // - delete exercise
    // - list exercises

    app.get("/exercises", function(req, res) {
        res.render("pages/exercises.njk", {
            exercises: [
                { name: "Exercise 1", id: 1 },
                { name: "Exercise 2", id: 2 },
                { name: "Exercise 3", id: 3 }
            ]
        });
    });

    app.get("/exercises/:id", function(req, res) {
        const exerciseId = req.params.id;
        const exercise = {
            name: "Exercise 1"
        };
        const questions = [
            {
                questionNumber: 1,
                questionText: "Placeholder question",
            }
        ]
        res.render("pages/exercise.njk", { exercise, questions });
    });

}
