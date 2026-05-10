import { useState } from "react";
import AuthPage from "./components/AuthPage";
import ChatSidebar from "./components/ChatSidebar";
import ChatWindow from "./components/ChatWindow";
import OnlineUsers from "./components/OnlineUsers";
import useChats from "./hooks/useChats";
import useMessages from "./hooks/useMessages";
import useSocket from "./hooks/useSocket";
import "./App.css";

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [statusText, setStatusText] = useState("");
  const [socketApi, setSocketApi] = useState({});

  const {
    chats,
    allUsers,
    activeChat,
    setActiveChat,
    usersByStatus,
    groupName,
    setGroupName,
    selectedUsers,
    toggleSelectedUser,
    createGroup,
    deleteChat,
    startChat,
    hasOnlineParticipant,
    isOnline,
    fetchUsers,
    setChats,
    setAllUsers
  } = useChats(token, user, setStatusText);

  const {
    messages,
    setMessages,
    messageText,
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
  } = useMessages({
    activeChat,
    user,
    token,
    socketApi,
    setStatusText
  });

  useSocket({
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
  });

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
    setStatusText("");
  };

  const getFileName = (fileUrl) => {
    const filePath = fileUrl.split("?")[0];
    const fileName = filePath.split("/").pop();
    return fileName?.replace(/^\d+-/, "") || "Attachment";
  };

  const isImageFile = (fileUrl) => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(fileUrl.split("?")[0]);

  const formatTime = (date) => new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  if (!token) {
    return (
      <AuthPage
        onLogin={(newToken, newUser) => {
          setToken(newToken);
          setUser(newUser);
          setStatusText("");
        }}
        statusText={statusText}
        setStatusText={setStatusText}
      />
    );
  }

  return (
    <main className="chat-shell">
      <ChatSidebar
        user={user}
        chats={chats}
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        allUsers={allUsers}
        groupName={groupName}
        setGroupName={setGroupName}
        selectedUsers={selectedUsers}
        toggleSelectedUser={toggleSelectedUser}
        createGroup={createGroup}
        deleteChat={deleteChat}
        startChat={startChat}
        usersByStatus={usersByStatus}
        hasOnlineParticipant={hasOnlineParticipant}
        logout={logout}
      />

      <ChatWindow
        activeChat={activeChat}
        statusText={statusText}
        messages={messages}
        isMessagesLoading={isMessagesLoading}
        typing={typing}
        messageText={messageText}
        handleMessageChange={handleMessageChange}
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
        addEmoji={addEmoji}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        uploadError={uploadError}
        isSending={isSending}
        sendMessage={sendMessage}
        formatTime={formatTime}
        getFileName={getFileName}
        isImageFile={isImageFile}
        user={user}
      />

      <OnlineUsers
        usersByStatus={usersByStatus}
        startChat={startChat}
        isOnline={isOnline}
      />
    </main>
  );
}

export default App;
