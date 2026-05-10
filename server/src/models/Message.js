const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat"
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    message: String,
    file: String
  },
  {
    timestamps: true
  }
);

messageSchema.index({ chatId: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);
