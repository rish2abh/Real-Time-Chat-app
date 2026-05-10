const jwt = require("jsonwebtoken");
const { Chat, Message, User } = require("../models");

let io = null;

const getParticipantRoomIds = async (userId) => {
  const chats = await Chat.find({ participants: userId })
    .select("participants")
    .lean();

  const roomIds = new Set();
  const currentUserId = userId.toString();

  chats.forEach((chat) => {
    chat.participants.forEach((participantId) => {
      const participant = participantId.toString();

      if (participant !== currentUserId) {
        roomIds.add(participant);
      }
    });
  });

  return [...roomIds];
};

const emitUserStatus = async (io, userId, status) => {
  const participantRoomIds = await getParticipantRoomIds(userId);
  const payload = { userId, status };

  participantRoomIds.forEach((participantId) => {
    io.to(participantId).emit("status", payload);
  });
};

const hasActiveUserSockets = async (io, userId) => {
  const sockets = await io.in(userId).allSockets();

  return sockets.size > 0;
};

const setupSocket = (server, corsOptions) => {
  io = require("socket.io")(server, {
    cors: corsOptions
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const user = jwt.verify(token, process.env.JWT_SECRET);

      socket.user = user;
      next();
    } catch (error) {
      console.error("[Socket Auth Error]", error.message);
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.user.userId;
    const wasOnline = await hasActiveUserSockets(io, userId);

    console.log(`[Socket] User connected: ${userId}`);
    socket.join(userId);

    if (!wasOnline) {
      try {
        await User.findByIdAndUpdate(userId, { status: "online" });
        await emitUserStatus(io, userId, "online");
      } catch (error) {
        console.error("[Socket Connection Error]", error.message);
      }
    }

    socket.on("join", (joinedUserId) => {
      socket.join(joinedUserId || userId);
    });

    socket.on("chat:join", async (chatId) => {
      if (!chatId) {
        return;
      }

      try {
        const chat = await Chat.findOne({
          _id: chatId,
          participants: userId
        });

        if (chat) {
          socket.join(`chat:${chatId}`);
          console.log(`[Socket] User ${userId} joined chat: ${chatId}`);
        }
      } catch (error) {
        console.error("[Socket Chat Join Error]", error.message);
      }
    });

    socket.on("leave", (chatId) => {
      if (chatId) {
        socket.leave(`chat:${chatId}`);
        console.log(`[Socket] User ${userId} left chat: ${chatId}`);
      }
    });

    socket.on("message:send", async (data, callback) => {
      try {
        const { chatId, message, file } = data;

        if (!chatId || (!message && !file)) {
          const error = { error: "chatId and message or file are required" };

          if (callback) {
            callback(error);
          }

          return socket.emit("message:error", error);
        }

        const chat = await Chat.findOne({
          _id: chatId,
          participants: userId
        });

        if (!chat) {
          const error = { error: "Chat not found" };

          if (callback) {
            callback(error);
          }

          return socket.emit("message:error", error);
        }

        const savedMessage = await Message.create({
          chatId,
          senderId: userId,
          message: message || "",
          file: file || null
        });

        const populatedMessage = await savedMessage.populate("senderId", "name email status");

        chat.participants.forEach((participantId) => {
          const participant = participantId.toString();

          if (participant !== userId.toString()) {
            io.to(participant).emit("message:receive", populatedMessage);
          }
        });
        socket.emit("message:receive", populatedMessage);

        if (callback) {
          callback({ message: populatedMessage });
        }
      } catch (error) {
        const response = { error: "Failed to send message" };
        console.error("[Socket Message Send Error]", error.message, error.stack);

        if (callback) {
          callback(response);
        }

        socket.emit("message:error", response);
      }
    });

    socket.on("typing", ({ chatId, isTyping = true }) => {
      if (!chatId) {
        return;
      }

      io.in(`chat:${chatId}`).except(socket.id).emit("typing", {
        chatId,
        senderId: socket.user.userId,
        userId: socket.user.userId,
        isTyping: Boolean(isTyping)
      });
    });

    socket.on("disconnect", async () => {
      try {
        console.log(`[Socket] User disconnected: ${userId}`);
        const isStillOnline = await hasActiveUserSockets(io, userId);

        if (isStillOnline) {
          return;
        }

        await User.findByIdAndUpdate(userId, { status: "offline" });
        await emitUserStatus(io, userId, "offline");
      } catch (error) {
        console.error("[Socket Disconnect Error]", error.message);
      }
    });
  });

  return io;
};

const getIo = () => io;

module.exports = {
  setupSocket,
  getIo
};
