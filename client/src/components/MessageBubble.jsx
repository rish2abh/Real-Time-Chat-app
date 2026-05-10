const MessageBubble = ({ msg, user, formatTime, getFileName, isImageFile }) => {
  const senderId = msg.senderId?._id || msg.senderId;
  const isMine = senderId === user?.id;
  const timestamp = msg.timestamp || msg.createdAt;

  return (
    <article className={`message ${isMine ? "mine" : ""}`}>
      {msg.message && <p>{msg.message}</p>}

      {msg.file && (
        isImageFile(msg.file) ? (
          <a className="image-preview" href={msg.file} target="_blank" rel="noreferrer">
            <img src={msg.file} alt={getFileName(msg.file)} />
          </a>
        ) : (
          <div className="file-card">
            <div>
              <strong>{getFileName(msg.file)}</strong>
              <span>Attachment</span>
            </div>
            <a href={msg.file} target="_blank" rel="noreferrer">
              Download
            </a>
          </div>
        )
      )}

      <time>{formatTime(timestamp)}</time>
    </article>
  );
};

export default MessageBubble;
