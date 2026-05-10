const { Chat, Message } = require("../models");
const { sendSuccess, sendError, asyncHandler } = require("../utils");

const getMessagesByChatId = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const chat = await Chat.findOne({
    _id: chatId,
    participants: req.user.userId
  });

  if (!chat) {
    console.error(`getMessages failed for chatId ${chatId}: chat not found`);
    return sendError(res, 404, "Chat not found");
  }

  const messages = await Message.find({ chatId })
    .populate("senderId", "name email status")
    .sort({ createdAt: 1 })
    .limit(50);

  return sendSuccess(res, 200, "Messages fetched successfully", messages);
});

module.exports = {
  getMessages: getMessagesByChatId,
  getMessagesByChatId
};
