import { useCallback, useEffect, useMemo, useState } from "react";
import { request, uploadFile } from "../api/client";

const useMessages = ({ activeChat, user, socketApi = {}, token, setStatusText }) => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [typingChats, setTypingChats] = useState({});

  useEffect(() => {
    if (!activeChat) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setIsMessagesLoading(true);

      try {
        const data = await request(`/api/messages/${activeChat._id}`, { token });
        setMessages(data);
        socketApi.joinChat?.(activeChat._id);
      } catch (error) {
        setStatusText(error.message);
      } finally {
        setIsMessagesLoading(false);
      }
    };

    fetchMessages();
  }, [activeChat, setStatusText, socketApi, token]);

  const uploadSelectedFile = useCallback(async () => {
    if (!selectedFile) {
      return null;
    }

    return uploadFile(selectedFile);
  }, [selectedFile]);

  const emitMessage = useCallback(async (payload) => {
    if (!socketApi.emitMessage) {
      throw new Error("Socket is not ready");
    }

    await socketApi.emitMessage(payload);
  }, [socketApi]);

  const sendMessage = useCallback(async (event) => {
    event.preventDefault();

    if (!activeChat || (!messageText.trim() && !selectedFile)) {
      return;
    }

    try {
      setIsSending(true);
      setUploadError("");
      const fileUrl = await uploadSelectedFile();

      await emitMessage({
        chatId: activeChat._id,
        message: messageText.trim(),
        file: fileUrl
      });

      setMessageText("");
      setSelectedFile(null);
      setShowEmojiPicker(false);
      setStatusText("");
    } catch (error) {
      setUploadError(error.message);
      setStatusText(error.message);
    } finally {
      setIsSending(false);
    }
  }, [activeChat, emitMessage, messageText, selectedFile, setStatusText, uploadSelectedFile]);

  const addEmoji = useCallback((emoji) => {
    setMessageText((current) => `${current}${emoji}`);
  }, []);

  const handleMessageChange = useCallback((event) => {
    const value = event.target.value;
    setMessageText(value);
    socketApi.sendTyping?.();
  }, [socketApi]);

  const typing = useMemo(() => Boolean(activeChat && typingChats[activeChat._id]), [activeChat, typingChats]);

  return {
    messages,
    setMessages,
    messageText,
    setMessageText,
    selectedFile,
    setSelectedFile,
    showEmojiPicker,
    setShowEmojiPicker,
    isMessagesLoading,
    isSending,
    uploadError,
    typing,
    handleMessageChange,
    addEmoji,
    sendMessage,
    setTypingChats
  };
};

export default useMessages;
