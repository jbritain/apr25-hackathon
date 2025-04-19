const { verifyToken } = require('../middleware/auth.js');

const fs = require('fs');

module.exports = function (app, db) {
    // we need routes to
    // - create exercise
    // - edit exercise
    // - delete exercise
    // - list exercises

    app.get("/exercises", verifyToken, async function(req, res) {
        try {
            // Get user classes
            const rows = await new Promise((resolve, reject) => {
                db.all("SELECT * FROM user_class WHERE userID = ?", [req.user.id], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });

            // Get class data for each user class
            const classPromises = rows.map(row => {
                return new Promise((resolve, reject) => {
                    db.get("SELECT * FROM class WHERE classCode = ?", [row.classCode], (err, classData) => {
                        if (err) reject(err);
                        else resolve(classData);
                    });
                });
            });
            const classes = await Promise.all(classPromises);

            // Extract class codes and create query placeholders
            const classCodes = classes.map(classData => classData.classCode);
            const placeholders = classCodes.map(() => '?').join(',');

            // Handle case where user has no classes
            if (classCodes.length === 0) {
                return res.json([]);
            }

            // Get exercises for these classes
            const exercises = await new Promise((resolve, reject) => {
                db.all(`SELECT * FROM exercise WHERE classCode IN (${placeholders})`, classCodes, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });

            // Send response with exercises data
            res.render("pages/exercises.njk", {user: req.user, exercises: exercises, classes: classes });

        } catch (err) {
            console.error("Error fetching exercises:", err);
            res.status(500).send("Internal Server Error");
        }
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
        db.all("SELECT * FROM question WHERE exerciseID = ?", [exerciseID], (err, questions) => {
            if (err) {
                console.error("Error fetching questions:", err);
                return res.status(500).send("Database error");
            }

            // Counter to track when all async operations are complete
            let pendingQueries = questions.length;

            // If there are no questions, render the page immediately
            if (pendingQueries === 0) {
                return res.render("pages/exercise.njk", {
                    user: req.user,
                    exercise: exerciseID,
                    questions: questions
                });
            }

            // Process each question and its messages
            questions.forEach(question => {
                db.all("SELECT m.*, u.name as username FROM message m LEFT JOIN user u ON m.userID = u.userID WHERE m.questionID = ?",
                    [question.questionID], (err, messages) => {
                    if (err) {
                        console.error("Error fetching messages:", err);
                        // Continue with empty messages array
                        question.messages = [];
                    } else {
                        question.messages = messages;
                    }

                    // Decrement the counter
                    pendingQueries--;

                    // When all queries are complete, render the response
                    if (pendingQueries === 0) {
                        res.render("pages/exercise.njk", {
                            user: req.user,
                            exercise: exerciseID,
                            questions: questions
                        });
                    }
                });
            });
        });
    });

    app.post("/exercises/:id/questions/add", verifyToken, function(req, res) {
        const exerciseID = req.params.id;
        const questionText = req.body.questionText;
        const questionNumber = req.body.questionNumber;

        let questionBlob = "";

        if(req.files.questionImage){
            questionBlob = fs.readFileSync(req.files.questionImage.tempFilePath, {encoding: 'base64'});
        }

        db.run("INSERT INTO question (exerciseID, questionText, questionPicture, questionNumber, isCorrect) VALUES (?, ?, ?, ?, ?)", [exerciseID, questionText, questionBlob, questionNumber, true], function(err) {
            if (err) {
                console.error(err);
                res.status(500).send("Error creating question");
            }
        });

        res.redirect("/exercises/" + exerciseID + "/")
    })

    app.post("/exercises/:id/messages/add", verifyToken, function(req, res) {
        const questionID = req.body.questionID;
        const messageText = req.body.newMessage;
        const messageDateTime = new Date().toISOString();

        db.run("INSERT INTO message (questionID, content, userID, dateTime) VALUES (?, ?, ?, ?)", [questionID, messageText, req.user.id, messageDateTime], function(err) {
            if (err) {
                console.error(err);
                res.status(500).send("Error creating message");
            }
        });

        res.redirect("/exercises/" + req.params.id + "/")
    })

}
