const ChatSidebar = ({
  user,
  chats,
  activeChat,
  setActiveChat,
  allUsers,
  groupName,
  setGroupName,
  selectedUsers,
  toggleSelectedUser,
  createGroup,
  deleteChat,
  startChat,
  usersByStatus,
  hasOnlineParticipant,
  logout
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

  const getChatSubtitle = (chat) => {
    if (!chat) {
      return "";
    }

    if (chat.isGroup) {
      return `${chat.participants.length} members`;
    }

    return getParticipant(chat)?.email || "No participant email";
  };

  return (
    <aside className="chat-list">
      <div className="sidebar-header">
        <div>
          <p className="eyebrow">Signed in</p>
          <h2>{user?.name || "User"}</h2>
        </div>
        <button type="button" onClick={logout}>Logout</button>
      </div>

      <form className="group-form" onSubmit={createGroup}>
        <label>
          Group name
          <input
            type="text"
            value={groupName}
            onChange={(event) => setGroupName(event.target.value)}
            placeholder="Project team"
          />
        </label>

        <div className="group-users">
          {allUsers.map((availableUser) => (
            <label key={availableUser._id}>
              <input
                type="checkbox"
                checked={selectedUsers.includes(availableUser._id)}
                onChange={() => toggleSelectedUser(availableUser._id)}
              />
              <span>
                <strong>{availableUser.name}</strong>
                <small>{availableUser.email}</small>
              </span>
            </label>
          ))}
        </div>

        <button type="submit">Create Group</button>
      </form>

      <div className="chats">
        {chats.map((chat) => (
          <div key={chat._id} className="chat-item">
            <button
              type="button"
              className={`chat-row ${activeChat?._id === chat._id ? "active" : ""}`}
              onClick={() => setActiveChat(chat)}
            >
              <span className={`presence ${hasOnlineParticipant(chat) ? "online" : ""}`} />
              <span>
                <strong>{getChatTitle(chat)}</strong>
                <small>{getChatSubtitle(chat)}</small>
              </span>
            </button>
            <button
              type="button"
              className="chat-delete-btn"
              onClick={(event) => deleteChat(event, chat._id)}
              title="Delete chat"
            >
              ×
            </button>
          </div>
        ))}

        {!chats.length && (
          <p className="empty-state">No chats found for this user.</p>
        )}
      </div>

      <div className="people-summary">
        <h3>People available</h3>
        <span>{usersByStatus.length}</span>
      </div>
    </aside>
  );
};

export default ChatSidebar;
