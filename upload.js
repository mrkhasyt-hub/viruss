const multer = require("multer");
const db = require("./db");

// Настройка хранения файлов
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        const unique = Date.now() + "_" + file.originalname;
        cb(null, unique);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 200 * 1024 * 1024 } // до 200 МБ
});

module.exports = {
    // Мидлвар для загрузки файла
    uploadFile: upload.single("file"),

    // Сохранение файла и/или сообщения
    saveFileAndMessage: (req, res) => {
        const message = req.body.message || "";

        if (!req.file && !message) {
            return res.status(400).send("Нет файла или сообщения");
        }

        if (req.file && message) {
            // Сохраняем сообщение и файл вместе
            db.run(
                "INSERT INTO messages(user_id, message) VALUES (?,?)",
                [req.user.id, message],
                function(err) {
                    if (err) return res.status(500).send("Ошибка при сохранении сообщения");
                    const messageId = this.lastID;

                    db.run(
                        "INSERT INTO files(user_id, filename, originalname, size, message_id) VALUES (?,?,?,?,?)",
                        [req.user.id, req.file.filename, req.file.originalname, req.file.size, messageId],
                        function(err) {
                            if(err) return res.status(500).send("Ошибка при сохранении файла");
                            res.send({ status: "ok", messageId, fileId: this.lastID });
                        }
                    );
                }
            );
        } else if (req.file) {
            // Только файл
            db.run(
                "INSERT INTO files(user_id, filename, originalname, size) VALUES (?,?,?,?)",
                [req.user.id, req.file.filename, req.file.originalname, req.file.size],
                function(err) {
                    if(err) return res.status(500).send("Ошибка при сохранении файла");
                    res.send({ status: "ok", fileId: this.lastID });
                }
            );
        } else {
            // Только сообщение
            db.run(
                "INSERT INTO messages(user_id, message) VALUES (?,?)",
                [req.user.id, message],
                function(err) {
                    if(err) return res.status(500).send("Ошибка при сохранении сообщения");
                    res.send({ status: "ok", messageId: this.lastID });
                }
            );
        }
    },

    // Получение всех сообщений с файлами (если есть)
    getMessages: (req, res) => {
        db.all(
            `SELECT m.id, m.user_id, m.message, f.filename, f.originalname 
             FROM messages m 
             LEFT JOIN files f ON f.message_id = m.id
             ORDER BY m.id DESC`,
            [],
            (err, rows) => {
                if (err) return res.status(500).send("Ошибка при получении сообщений");
                res.json(rows);
            }
        );
    }
};
