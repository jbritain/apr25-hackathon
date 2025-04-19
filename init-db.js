function initDB(db){
    db.serialize(() => {
      db.run(`
          CREATE TABLE IF NOT EXISTS user (
              name TEXT NOT NULL,
              userID TEXT NOT NULL PRIMARY KEY,
              isTeacher BOOLEAN NOT NULL,
              password TEXT NOT NULL
          )`
        )

        db.run(`
            CREATE TABLE IF NOT EXISTS class (
                className TEXT NOT NULL,
                classCode INTEGER NOT NULL PRIMARY KEY
            )`
          )

        db.run(`
            CREATE TABLE IF NOT EXISTS user_class (
                userID TEXT NOT NULL,
                classCode INTEGER NOT NULL,
                PRIMARY KEY (userID, classCode),
                FOREIGN KEY (userID) REFERENCES user(userID),
                FOREIGN KEY (classCode) REFERENCES class(classCode)
            )`
        )
        
        db.run(`
            CREATE TABLE IF NOT EXISTS excercise (
                name TEXT NOT NULL,
                incentive TEXT NOT NULL,
                pointValue INTEGER NOT NULL
            )`
          )

        db.run(`
            CREATE TABLE IF NOT EXISTS question (
                questionNumber INTEGER NOT NULL,
                questionPicture BLOB NOT NULL,
                questionText TEXT NOT NULL,
                isCorrect BOOLEAN NOT NULL
            )`
          )

        db.run(`
            CREATE TABLE IF NOT EXISTS answer (
                answerImage BLOB NOT NULL,
                answerText TEXT NOT NULL,
                isCorrect BOOLEAN NOT NULL
            )`
          )

        db.run(`
            CREATE TABLE IF NOT EXISTS message (
                content TEXT NOT NULL,
                dateTime DATETIME NOT NULL
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
