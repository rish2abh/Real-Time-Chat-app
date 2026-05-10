const { User } = require("../models");
const { sendSuccess, sendError, asyncHandler } = require("../utils");

const getOnlineUsers = asyncHandler(async (req, res) => {
  const users = await User.find({
    _id: { $ne: req.user.userId },
    status: "online"
  }).select("name email status");

  return sendSuccess(res, 200, "Online users fetched successfully", users);
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({
    _id: { $ne: req.user.userId }
  })
    .select("name email status")
    .sort({ name: 1 });

  return sendSuccess(res, 200, "Users fetched successfully", users);
});

module.exports = {
  getUsers,
  getOnlineUsers
};
