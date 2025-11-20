const multer = require("multer");
const db = require("./db");

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        const unique = Date.now() + "_" + file.originalname;
        cb(null, unique);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 200 * 1024 * 1024 }
});

module.exports = {
    uploadFile: upload.single("file"),

    saveFileToDB: (req, res) => {
        if (!req.file) return res.status(400).send("Нет файла");

        db.run(
            "INSERT INTO files(user_id, filename, originalname, size) VALUES (?,?,?,?)",
            [req.user.id, req.file.filename, req.file.originalname, req.file.size],
            () => res.send("ok")
        );
    }
};