import MessageBubble from "./MessageBubble";

const MessageList = ({ messages, user, formatTime, getFileName, isImageFile }) => {
  return (
    <div className="messages">
      {messages.map((msg) => (
        <MessageBubble
          key={msg._id || `${msg.timestamp}-${msg.message}`}
          msg={msg}
          user={user}
          formatTime={formatTime}
          getFileName={getFileName}
          isImageFile={isImageFile}
        />
      ))}
    </div>
  );
};

export default MessageList;
