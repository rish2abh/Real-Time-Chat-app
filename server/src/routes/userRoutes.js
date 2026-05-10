const express = require("express");
const router = express.Router();

const { auth } = require("../middleware");
const {
  getUsers,
  getOnlineUsers
} = require("../controllers");

router.get("/", auth, getUsers);
router.get("/online", auth, getOnlineUsers);

module.exports = router;
