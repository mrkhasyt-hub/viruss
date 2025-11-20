const db = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET = "SUPER_SECRET_KEY";

module.exports = {
    register: async (req, res) => {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).send("Заполните поля");

        const hash = await bcrypt.hash(password, 10);

        db.run("INSERT INTO users(username,password) VALUES(?,?)", [username, hash], err => {
            if (err) return res.status(400).send("Пользователь уже существует");
            res.send("ok");
        });
    },

    login: async (req, res) => {
        const { username, password } = req.body;
        db.get("SELECT * FROM users WHERE username=?", [username], async (err, user) => {
            if (!user) return res.status(400).send("Неверно");

            const ok = await bcrypt.compare(password, user.password);
            if (!ok) return res.status(400).send("Неверно");

            const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "7d" });

            res.cookie("token", token, { httpOnly: true });
            res.send("ok");
        });
    },

    SECRET
};