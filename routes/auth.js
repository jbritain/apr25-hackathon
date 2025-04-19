const { generateToken } = require("../middleware/auth.js")

module.exports = function(app, db){
    app.post("/auth/register", (req, res) => {
        console.log(req.body);
        const name = req.body.name;
        const password = req.body.password;
        const isTeacher = req.body.isTeacher === 'true';

        db.serialize(() => {
            db.run('INSERT INTO user (name, password, isTeacher) VALUES (?, ?, ?)', [name, password, isTeacher], (err) => {
                if (err) {
                    console.error(err);
                    res.render("pages/register.njk", { error: err.message });
                } else {
                    res.redirect('/auth/login');
                }
            });
        });
    });

    app.get("/auth/register", (req, res) => {
        res.render("pages/register.njk");
    })

    app.get("/auth/login", (req, res) => {
        res.render("pages/login.njk");
    })

    app.post("/auth/login", (req, res) => {
        const name = req.body.name;
        const password = req.body.password;
        db.serialize(() => {
            db.get('SELECT * FROM user WHERE name =  ?', [name], (err, row) => {
                if (err) {
                    console.error(err);
                    res.render("pages/login.njk", { error: err.message });
                } else if (!row) {
                    res.render("pages/login.njk", { error: 'User not found' });
                } else if (row.password !== password) {
                    res.render("pages/login.njk", { error: 'Incorrect password' });
                } else {
                    const token = generateToken(row.id, row.name, row.isTeacher);
                    res.cookie('token', token, { httpOnly: true });
                    res.redirect('/');
                }
            });
        });
    })
}
