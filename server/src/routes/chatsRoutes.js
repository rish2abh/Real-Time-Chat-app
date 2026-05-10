const express = require("express");
const router = express.Router();

const {
  auth,
  validate
} = require("../middleware");
const {
  createChat,
  createGroupChat,
  deleteChat,
  getChats
} = require("../controllers");
const {
  createChatSchema,
  createGroupChatSchema
} = require("../validations");

router.post("/", auth, validate(createChatSchema), createChat);
router.post("/group", auth, validate(createGroupChatSchema), createGroupChat);
router.get("/", auth, getChats);
router.delete("/:chatId", auth, deleteChat);

module.exports = router;
