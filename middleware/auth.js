const jwt = require('jsonwebtoken');

const privKey = "TODO-CHANGE-ME-PLEASE";

function generateToken(userID){
    return jwt.sign({ userID: userID }, privKey);
}

function verifyToken(req, res, next){
    let token = req.cookies.token;
    try {
        let decoded = jwt.verify(token, privKey);
        req.userID = decoded.userID;
        req.name = decoded.name;
        req.isTeacher = decoded.isTeacher;
        next();
    } catch(err) {
        res.redirect('/auth/login');
    }
}

module.exports = {
    generateToken,
    verifyToken
};
