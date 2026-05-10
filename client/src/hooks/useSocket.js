import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { API_URL } from "../api/client";

const useSocket = ({
  token,
  activeChat,
  user,
  setChats,
  setAllUsers,
  setMessages,
  setTypingChats,
  fetchUsers,
  setStatusText,
  setSocketApi
}) => {
  const socketRef = useRef(null);
  const incomingTypingTimeoutsRef = useRef({});
  const activeChatRef = useRef(activeChat);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const socket = io(API_URL, {
      auth: { token },
      transports: ["websocket"]
    });

    socketRef.current = socket;

    const joinChat = (chatId) => {
      if (chatId) {
        socket.emit("chat:join", chatId);
      }
    };

    const leaveChat = (chatId) => {
      if (chatId) {
        socket.emit("leave", chatId);
      }
    };

    const sendTyping = () => {
      if (activeChatRef.current) {
        socket.emit("typing", { chatId: activeChatRef.current._id });
      }
    };

    const emitMessage = (payload) => new Promise((resolve, reject) => {
      if (!socket?.connected) {
        reject(new Error("Socket is not connected"));
        return;
      }

      socket.emit("message:send", payload, (response) => {
        if (response?.error) {
          reject(new Error(response.error));
          return;
        }

        resolve(response);
      });
    });

    setSocketApi({ joinChat, leaveChat, sendTyping, emitMessage });

    socket.on("connect", () => {
      setStatusText("Connected");

      if (activeChatRef.current?._id) {
        joinChat(activeChatRef.current._id);
      }
    });

    socket.on("connect_error", () => {
      setStatusText("Socket authentication failed");
    });

    socket.on("message:error", (error) => {
      setStatusText(error?.error || "Failed to send message");
    });

    socket.on("message:receive", (msg) => {
      setMessages((prev) => {
        if (prev.some((item) => item._id === msg._id)) {
          return prev;
        }

        return [...prev, msg];
      });
    });

    socket.on("typing", ({ chatId, senderId }) => {
      if (senderId === user?.id) {
        return;
      }

      if (incomingTypingTimeoutsRef.current[chatId]) {
        clearTimeout(incomingTypingTimeoutsRef.current[chatId]);
      }

      setTypingChats((prev) => ({
        ...prev,
        [chatId]: true
      }));

      incomingTypingTimeoutsRef.current[chatId] = setTimeout(() => {
        setTypingChats((prev) => ({
          ...prev,
          [chatId]: false
        }));
      }, 2000);
    });

    socket.on("status", ({ userId, status }) => {
      setChats((prev) => prev.map((chat) => ({
        ...chat,
        participants: chat.participants.map((participant) => (
          participant._id === userId ? { ...participant, status } : participant
        ))
      })));

      setAllUsers((prev) => prev.map((availableUser) => (
        availableUser._id === userId ? { ...availableUser, status } : availableUser
      )));

      fetchUsers();
    });

    socket.on("chat:created", (chat) => {
      setChats((prev) => {
        if (prev.some((item) => item._id === chat._id)) {
          return prev;
        }

        return [chat, ...prev];
      });
    });

    return () => {
      Object.values(incomingTypingTimeoutsRef.current).forEach(clearTimeout);
      incomingTypingTimeoutsRef.current = {};
      socket.disconnect();
    };
  }, [token, fetchUsers, setChats, setAllUsers, setMessages, setStatusText, setTypingChats, user?.id, setSocketApi]);

  return {
    socketRef,
    incomingTypingTimeoutsRef
  };
};

export default useSocket;
