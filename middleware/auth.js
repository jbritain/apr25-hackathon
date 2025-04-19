const jwt = require('jsonwebtoken');

const privKey = "TODO-CHANGE-ME-PLEASE";

function generateToken(userID, name, isTeacher){
    return jwt.sign({ userID: userID, name: name, isTeacher: isTeacher }, privKey);
}

function verifyToken(req, res, next){
    let token = req.cookies.token;
    try {
        let decoded = jwt.verify(token, privKey);
        req.user = {
            id: decoded.userID,
            name: decoded.name,
            isTeacher: decoded.isTeacher
        }
        next();
    } catch(err) {
        res.redirect('/auth/login');
    }
}

module.exports = {
    generateToken,
    verifyToken
};
