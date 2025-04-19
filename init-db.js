function initDB(db){
    db.serialize(() => {
      db.run(`
          CREATE TABLE IF NOT EXISTS user (
              name TEXT NOT NULL UNIQUE,
              isTeacher BOOLEAN NOT NULL,
              password TEXT NOT NULL
          )`
    )});
}

module.exports = initDB;
