const { register, login } = require("./authController");
const { createChat, createGroupChat, getChats, deleteChat } = require("./chatsController");
const { getMessagesByChatId } = require("./messageController");
const { uploadFile } = require("./uploadController");
const { getUsers, getOnlineUsers } = require("./userController");

module.exports = {
  createChat,
  createGroupChat,
  deleteChat,
  getChats,
  getMessagesByChatId,
  getOnlineUsers,
  getUsers,
  login,
  register,
  uploadFile
};
