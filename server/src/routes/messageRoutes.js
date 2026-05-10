const express = require("express");
const router = express.Router();

const {
  auth,
  validate
} = require("../middleware");
const {
  getMessagesByChatId
} = require("../controllers");
const {
  getMessagesSchema
} = require("../validations");

router.get("/:chatId", auth, validate(getMessagesSchema, "params"), getMessagesByChatId);

module.exports = router;
