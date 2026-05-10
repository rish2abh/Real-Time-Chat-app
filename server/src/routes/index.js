const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const chatsRoutes = require("./chatsRoutes");
const messageRoutes = require("./messageRoutes");
const userRoutes = require("./userRoutes");

router.use("/auth", authRoutes);
router.use("/chats", chatsRoutes);
router.use("/messages", messageRoutes);
router.use("/users", userRoutes);

module.exports = router;
