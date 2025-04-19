function initDB(db){
    db.serialize(() => {
      db.run(`
          CREATE TABLE IF NOT EXISTS user (
              name TEXT NOT NULL,
              userID INTEGER PRIMARY KEY,
              isTeacher BOOLEAN NOT NULL,
              password TEXT NOT NULL
          )`
        )

        db.run(`
            CREATE TABLE IF NOT EXISTS class (
                className TEXT NOT NULL,
                classCode INTEGER PRIMARY KEY
            )`
          )

        db.run(`
            CREATE TABLE IF NOT EXISTS user_class (
                userID INTEGER NOT NULL,
                classCode INTEGER NOT NULL,
                PRIMARY KEY (userID, classCode),
                FOREIGN KEY (userID) REFERENCES user(userID),
                FOREIGN KEY (classCode) REFERENCES class(classCode)
            )`
        )

        db.run(`
            CREATE TABLE IF NOT EXISTS exercise (
                exerciseID INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                incentive TEXT NOT NULL,
                pointValue INTEGER NOT NULL,
                classCode INTEGER NOT NULL,
                FOREIGN KEY (classCode) REFERENCES class(classCode)
            )`
          )

        db.run(`
            CREATE TABLE IF NOT EXISTS question (
                questionID INTEGER PRIMARY KEY,
                questionNumber INTEGER NOT NULL,
                questionPicture BLOB,
                questionText TEXT NOT NULL,
                isCorrect BOOLEAN NOT NULL,
                exerciseID INTEGER NOT NULL,
                FOREIGN KEY (exerciseID) REFERENCES exercise(exerciseID)
            )`
          )

        db.run(`
            CREATE TABLE IF NOT EXISTS answer (
                answerID INTEGER PRIMARY KEY,
                answerImage BLOB,
                answerText TEXT NOT NULL,
                isCorrect BOOLEAN NOT NULL,
                marked BOOLEAN NOT NULL,
                userID INTEGER NOT NULL,
                questionID INTEGER NOT NULL,
                FOREIGN KEY (userID) REFERENCES user(userID),
                FOREIGN KEY (questionID) REFERENCES question(questionID)
            )`
          )

        db.run(`
            CREATE TABLE IF NOT EXISTS message (
                messageID INTEGER PRIMARY KEY,
                content TEXT NOT NULL,
                dateTime DATETIME NOT NULL,
                userID INTEGER NOT NULL,
                questionID INTEGER NOT NULL,
                FOREIGN KEY (userID) REFERENCES user(userID),
                FOREIGN KEY (questionID) REFERENCES question(questionID)
            )`, (err) => {
              if (err) {
                console.error("Error creating table:", err.message);
              } else {
                console.log("All tables created successfully");
              }
            }
          )
    });
}

module.exports = initDB;
