import MessageList from "./MessageList";
import Composer from "./Composer";

const ChatWindow = ({
  activeChat,
  statusText,
  messages,
  isMessagesLoading,
  typing,
  messageText,
  handleMessageChange,
  showEmojiPicker,
  setShowEmojiPicker,
  addEmoji,
  selectedFile,
  setSelectedFile,
  uploadError,
  isSending,
  sendMessage,
  formatTime,
  getFileName,
  isImageFile,
  user
}) => {
  const getParticipant = (chat) => (
    chat.participants.find((participant) => participant._id !== user?.id) || chat.participants[0]
  );

  const getChatTitle = (chat) => {
    if (!chat) {
      return "Chat";
    }

    if (chat.isGroup) {
      return chat.groupName || "Group Chat";
    }

    return getParticipant(chat)?.name || "Chat";
  };

  return (
    <section className="chat-window">
      {activeChat ? (
        <>
          <header className="window-header">
            <div>
              <h1>{getChatTitle(activeChat)}</h1>
              <p>{statusText}</p>
            </div>
          </header>

          {isMessagesLoading ? (
            <div className="chat-loading">
              <span />
              <p>Loading messages...</p>
            </div>
          ) : (
            <MessageList
              messages={messages}
              user={user}
              formatTime={formatTime}
              getFileName={getFileName}
              isImageFile={isImageFile}
            />
          )}

          {typing && <p className="typing-indicator">Typing...</p>}

          <Composer
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
          />
        </>
      ) : (
        <div className="no-chat">
          <h1>Select a chat</h1>
        </div>
      )}
    </section>
  );
};

export default ChatWindow;
