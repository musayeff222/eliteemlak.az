const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const express = require("express");
const { authMiddleware } = require("../lib/auth");
const { ensureUploadDir, publicUrlFor, resolveUploadDir } = require("../lib/uploads");

const router = express.Router();

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    try {
      cb(null, ensureUploadDir());
    } catch (err) {
      cb(err);
    }
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname || "").toLowerCase().slice(0, 10);
    const safeExt = /^\.(jpe?g|png|webp|gif)$/i.test(ext) ? ext : ".jpg";
    const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${safeExt}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (!file.mimetype || !file.mimetype.startsWith("image/")) {
      return cb(new Error("Yalnız şəkil faylları qəbul olunur"));
    }
    cb(null, true);
  },
});

router.use(authMiddleware);

router.post("/", (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      const msg = err.message || "Yükləmə xətası";
      const status = err.code === "LIMIT_FILE_SIZE" ? 400 : 400;
      return res.status(status).json({ error: msg });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Şəkil seçilməyib" });
    }
    const url = publicUrlFor(req.file.filename);
    res.status(201).json({
      ok: true,
      url,
      filename: req.file.filename,
      size: req.file.size,
      dir: resolveUploadDir(),
    });
  });
});

module.exports = router;
