const OnlineUsers = ({ usersByStatus, startChat, isOnline }) => {
  return (
    <aside className="online-users">
      <header className="online-header">
        <div>
          <p className="eyebrow">People</p>
          <h2>All Users</h2>
        </div>
        <span>{usersByStatus.length}</span>
      </header>

      <div className="online-list">
        {usersByStatus.map((availableUser) => (
          <button
            type="button"
            className="online-user"
            key={availableUser._id}
            onClick={() => startChat(availableUser._id)}
          >
            <span className={`presence ${isOnline(availableUser) ? "online" : ""}`} />
            <span>
              <strong>{availableUser.name}</strong>
              <small>{availableUser.email}</small>
            </span>
            <span className={`user-status ${isOnline(availableUser) ? "online" : "offline"}`}>
              {isOnline(availableUser) ? "Online" : "Offline"}
            </span>
          </button>
        ))}

        {!usersByStatus.length && (
          <p className="empty-state">No other users found.</p>
        )}
      </div>
    </aside>
  );
};

export default OnlineUsers;
