const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    isGroup: {
      type: Boolean,
      default: false
    },
    groupName: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

chatSchema.index({ participants: 1 });

module.exports = mongoose.model("Chat", chatSchema);
