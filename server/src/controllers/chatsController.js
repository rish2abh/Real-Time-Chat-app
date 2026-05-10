const { Chat } = require("../models");
const { sendSuccess, sendError, asyncHandler } = require("../utils");
const { getIo } = require("../socket");

const createChat = asyncHandler(async (req, res) => {
  const participantId = req.body.userId || req.body.participantId;
  const userId = req.user.userId;

  if (participantId === userId) {
    console.warn("createChat blocked: user attempted to create a chat with themselves");
    return sendError(res, 400, "Cannot create chat with yourself");
  }

  const chat = await Chat.findOne({
    participants: { $all: [userId, participantId] },
    isGroup: false
  }).populate("participants", "name email status");

  if (chat) {
    return sendSuccess(res, 200, "Chat fetched successfully", chat);
  }

  const newChat = await Chat.create({
    participants: [userId, participantId]
  });

  const populatedChat = await newChat.populate("participants", "name email status");

  return sendSuccess(res, 201, "Chat created successfully", populatedChat);
});

const createGroupChat = asyncHandler(async (req, res) => {
  const { groupName, users } = req.body;
  const userId = req.user.userId;

  if (!Array.isArray(users) || users.length < 1) {
    console.warn("createGroupChat invalid participant list:", users);
    return sendError(res, 400, "Select at least one participant besides yourself");
  }

  const participants = [...new Set([...users, userId])];

  if (participants.length < 2) {
    console.warn("createGroupChat invalid participant list:", users);
    return sendError(res, 400, "Select at least one participant besides yourself");
  }

  const groupChat = await Chat.create({
    participants,
    isGroup: true,
    groupName: groupName.trim()
  });

  const populatedChat = await groupChat.populate("participants", "name email status");

  const io = getIo();

  if (io) {
    participants.forEach((participantId) => {
      if (participantId.toString() !== userId.toString()) {
        io.to(participantId.toString()).emit("chat:created", populatedChat);
      }
    });
  }

  return sendSuccess(res, 201, "Group chat created successfully", populatedChat);
});

const getChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({
    participants: req.user.userId
  })
    .populate("participants", "name email status")
    .sort({ updatedAt: -1 });

  return sendSuccess(res, 200, "Chats fetched successfully", chats);
});

const deleteChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.userId;

  const chat = await Chat.findOne({
    _id: chatId,
    participants: userId
  });

  if (!chat) {
    console.warn("deleteChat chat not found:", chatId);
    return sendError(res, 404, "Chat not found");
  }

  await Chat.deleteOne({ _id: chatId });

  return sendSuccess(res, 200, "Chat deleted successfully");
});

module.exports = {
  createChat,
  createGroupChat,
  getChats,
  deleteChat
};
