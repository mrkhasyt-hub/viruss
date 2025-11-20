const jwt = require("jsonwebtoken");
const { SECRET } = require("./auth");

module.exports = function(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.status(401).send("Вы не авторизованы");

    try {
        req.user = jwt.verify(token, SECRET);
        next();
    } catch {
        return res.status(401).send("Неверный токен");
    }
};