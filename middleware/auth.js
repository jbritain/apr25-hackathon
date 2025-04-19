const jwt = require('jsonwebtoken');

const privKey = "TODO-CHANGE-ME-PLEASE";

function generateToken(userID){
    return jwt.sign({ userID: userID }, privKey);
}

function verifyToken(req, res, next){
    let token = req.header("Authorization");
    try {
        let decoded = jwt.verify(token, privKey);
        req.userID = decoded.userID;
        next();
    } catch(err) {
        res.status(401).json({ error: 'Invalid token' });
    }
}

module.exports = {
    generateToken,
    verifyToken
};
