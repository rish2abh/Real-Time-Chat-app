const express = require("express");
const router = express.Router();

const { upload } = require("../middleware");
const { uploadFile } = require("../controllers");
const { sendError } = require("../utils");

router.post("/", (req, res, next) => {
  upload.single("file")(req, res, (error) => {
    if (error) {
      const message = error.code === "LIMIT_FILE_SIZE"
        ? "File must be 5MB or smaller"
        : error.message;

      return sendError(res, 400, message);
    }

    next();
  });
}, uploadFile);

module.exports = router;
