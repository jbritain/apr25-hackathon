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

            // Three queries per question now: messages, current user's answer, all answers
            let pendingQueries = questions.length * 3;

            if (pendingQueries === 0) {
                return res.render("pages/exercise.njk", {
                    user: req.user,
                    exercise: exerciseID,
                    questions: questions
                });
            }

            questions.forEach(question => {
                // Fetch messages
                db.all(
                    "SELECT m.*, u.name as username FROM message m LEFT JOIN user u ON m.userID = u.userID WHERE m.questionID = ?",
                    [question.questionID],
                    (err, messages) => {
                        question.messages = err ? [] : messages;
                        if (err) console.error("Error fetching messages:", err);

                        pendingQueries--;
                        if (pendingQueries === 0) {
                            res.render("pages/exercise.njk", {
                                user: req.user,
                                exercise: exerciseID,
                                questions: questions
                            });
                        }
                    }
                );

                // Fetch current user's answer
                db.get(
                    "SELECT * FROM answer WHERE questionID = ? AND userID = ?",
                    [question.questionID, req.user.id],
                    (err, answer) => {
                        question.answer = err ? null : answer;
                        if (err) console.error("Error fetching user answer:", err);

                        pendingQueries--;
                        if (pendingQueries === 0) {
                            res.render("pages/exercise.njk", {
                                user: req.user,
                                exercise: exerciseID,
                                questions: questions
                            });
                        }
                    }
                );

                // Fetch all answers for the question
                // Fetch all answers for the question, along with user names
                db.all(
                    "SELECT a.*, u.name as username FROM answer a LEFT JOIN user u ON a.userID = u.userID WHERE a.questionID = ?",
                    [question.questionID],
                    (err, answers) => {
                        question.answers = err ? [] : answers;
                        if (err) console.error("Error fetching all answers with usernames:", err);

                        pendingQueries--;
                        if (pendingQueries === 0) {
                            res.render("pages/exercise.njk", {
                                user: req.user,
                                exercise: exerciseID,
                                questions: questions
                            });
                        }
                    }
                );
            });
        });
    });


    app.post("/exercises/:id/questions/add", verifyToken, function (req, res) {
        const exerciseID = req.params.id;
        const questionText = req.body.questionText;
        const questionNumber = req.body.questionNumber;

        let questionBlob = "";

        try{
            questionBlob = fs.readFileSync(req.files.questionImage.tempFilePath, { encoding: 'base64' });
        } catch(e){
        }

        db.run("INSERT INTO question (exerciseID, questionText, questionPicture, questionNumber, isCorrect) VALUES (?, ?, ?, ?, ?)", [exerciseID, questionText, questionBlob, questionNumber, true], function (err) {
            if (err) {
                console.error(err);
                res.status(500).send("Error creating question");
            }
        });

        res.redirect("/exercises/" + exerciseID + "/")
    });

    app.post("/exercises/:id/questions/markAnswer/:answerID", verifyToken, async function (req, res) {
        const answerID = req.params.answerID;
        const isCorrect = req.body.markCorrect;
        console.log(isCorrect);

        try {
            await db.run("UPDATE answer SET (marked, isCorrect) = (?,?) WHERE answerID = ?", [true, isCorrect == "true", answerID], function(err) {
                if (err) {
                    console.error(err);
                    res.status(500).send("Error marking answer");
                }

                res.redirect("/exercises/" + req.params.id + "/");
            });
        } catch(e) {
            console.error(e);
            res.status(500).send("Error marking answer");
        }


    });

    app.post("/exercises/:id/questions/answer", verifyToken, async function (req, res) {
        const questionID = req.body.questionID;
        const answerText = req.body.answerText;
        let imageBlob = "";

        if(req.files)
            imageBlob = fs.readFileSync(req.files.file.tempFilePath, { encoding: 'base64' });



        await db.run("DELETE FROM answer WHERE userID = ? AND questionID = ?", [req.user.id, questionID], function(err) {
            if (err) {
                console.error(err);
            }
        });

        await db.run("INSERT INTO answer (userID, questionID, answerText, answerImage, isCorrect, marked) VALUES (?, ?, ?, ?, ?, ?)", [req.user.id, questionID, answerText, imageBlob, true, false], function(err) {
            if (err) {
                console.error(err);
            }
        });

        res.redirect("/exercises/" + req.params.id + "/");

    });

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
