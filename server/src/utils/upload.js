const multer = require("multer");
const { sendError } = require("./apiResponse");

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

const singleFileUpload = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (error) => {
    if (error) {
      const message = error.code === "LIMIT_FILE_SIZE"
        ? "File must be 5MB or smaller"
        : error.message;

      return sendError(res, 400, message);
    }

    next();
  });
};

module.exports = {
  upload,
  singleFileUpload
};
