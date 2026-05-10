const Composer = ({
  messageText,
  handleMessageChange,
  showEmojiPicker,
  setShowEmojiPicker,
  addEmoji,
  selectedFile,
  setSelectedFile,
  uploadError,
  isSending,
  sendMessage
}) => {
  return (
    <>
      <form className="composer" onSubmit={sendMessage}>
        <div className="message-field">
          {showEmojiPicker && (
            <div className="emoji-picker">
              {[
                "😀", "😂", "😍", "😎", "👍", "🙏", "🔥", "🎉", "❤️", "💬", "✅", "🙌"
              ].map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  aria-label={`Add ${emoji}`}
                  onClick={() => addEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            className="emoji-toggle"
            aria-label="Open emoji picker"
            title="Emoji"
            onClick={() => setShowEmojiPicker((current) => !current)}
          >
            ☺
          </button>
          <input
            value={messageText}
            onChange={handleMessageChange}
            placeholder="Type a message"
          />
        </div>

        <label className="file-button">
          File
          <input
            type="file"
            onChange={(event) => {
              setSelectedFile(event.target.files[0] || null);
            }}
          />
        </label>

        <button type="submit" disabled={isSending}>
          {isSending ? "Sending..." : "Send"}
        </button>
      </form>

      {selectedFile && (
        <p className="selected-file">
          {selectedFile.name}
          <button type="button" onClick={() => setSelectedFile(null)}>Remove</button>
        </p>
      )}
      {uploadError && <p className="upload-error">{uploadError}</p>}
    </>
  );
};

export default Composer;
