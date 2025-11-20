const express = require("express");
const cookieParser = require("cookie-parser");
const auth = require("./auth");
const checkAuth = require("./middleware");
const upload = require("./upload");
const db = require("./db");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

// AUTH
app.post("/api/register", auth.register);
app.post("/api/login", auth.login);

// UPLOAD
app.post("/api/upload", checkAuth, upload.uploadFile, upload.saveFileToDB);

// FILE LIST
app.get("/api/files", checkAuth, (req, res) => {
    db.all("SELECT * FROM files", [], (err, rows) => res.json(rows));
});

// DOWNLOAD
app.get("/download/:id", checkAuth, (req, res) => {
    db.get("SELECT * FROM files WHERE id=?", [req.params.id], (err, file) => {
        if (!file) return res.status(404).send("Нет файла");
        res.download(__dirname + "/uploads/" + file.filename, file.originalname);
    });
});

app.listen(3000, () => console.log("http://localhost:3000"));