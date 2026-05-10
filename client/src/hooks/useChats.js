import { useCallback, useEffect, useMemo, useState } from "react";
import { request } from "../api/client";

const getParticipantId = (participant) => participant?._id || participant?.id || participant;
const isSameId = (firstId, secondId) => firstId && secondId && String(firstId) === String(secondId);
const findDirectChat = (participantId, chatList) => chatList.find((chat) => (
  !chat.isGroup && chat.participants.some((participant) => (
    isSameId(getParticipantId(participant), participantId)
  ))
));

const useChats = (token, user, setStatusText) => {
  const [chats, setChats] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const fetchChats = useCallback(async () => {
    try {
      const data = await request("/api/chats", { token });
      setChats(data);
      setActiveChat((current) => current || data[0] || null);
    } catch (error) {
      setStatusText(error.message);
    }
  }, [token, setStatusText]);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await request("/api/users", { token });
      setAllUsers(data);
    } catch (error) {
      setStatusText(error.message);
    }
  }, [token, setStatusText]);

  useEffect(() => {
    if (!token) {
      setChats([]);
      setAllUsers([]);
      setActiveChat(null);
      return;
    }

    fetchChats();
    fetchUsers();
  }, [token, fetchChats, fetchUsers]);

  const startChat = useCallback(async (participantId) => {
    const existingChat = findDirectChat(participantId, chats);

    if (existingChat) {
      setActiveChat(existingChat);
      setStatusText("");
      return;
    }

    try {
      const chat = await request("/api/chats", {
        token,
        method: "POST",
        body: JSON.stringify({ participantId })
      });

      setChats((prev) => {
        const exists = prev.some((item) => item._id === chat._id);

        if (exists) {
          return prev.map((item) => (item._id === chat._id ? chat : item));
        }

        return [chat, ...prev];
      });

      setActiveChat(chat);
      setStatusText("");
    } catch (error) {
      setStatusText(error.message);
    }
  }, [chats, setStatusText, token]);

  const deleteChat = useCallback(async (event, chatId) => {
    event.stopPropagation();

    try {
      await request(`/api/chats/${chatId}`, {
        token,
        method: "DELETE"
      });

      setChats((prev) => prev.filter((item) => item._id !== chatId));

      if (activeChat?._id === chatId) {
        setActiveChat(null);
      }

      setStatusText("");
    } catch (error) {
      setStatusText(error.message);
    }
  }, [activeChat, setStatusText, token]);

  const toggleSelectedUser = useCallback((selectedUserId) => {
    setSelectedUsers((current) => (
      current.includes(selectedUserId)
        ? current.filter((id) => id !== selectedUserId)
        : [...current, selectedUserId]
    ));
  }, []);

  const createGroup = useCallback(async (event) => {
    event.preventDefault();

    if (!selectedUsers.length) {
      setStatusText("Select at least one participant to create the group.");
      return;
    }

    try {
      const chat = await request("/api/chats/group", {
        token,
        method: "POST",
        body: JSON.stringify({
          groupName,
          users: selectedUsers
        })
      });

      setChats((prev) => [chat, ...prev.filter((item) => item._id !== chat._id)]);
      setActiveChat(chat);
      setGroupName("");
      setSelectedUsers([]);
      setStatusText("");
    } catch (error) {
      setStatusText(error.message);
    }
  }, [groupName, selectedUsers, setStatusText, token]);

  const usersByStatus = useMemo(() => (
    [...allUsers].sort((firstUser, secondUser) => {
      if (firstUser.status === secondUser.status) {
        return firstUser.name.localeCompare(secondUser.name);
      }

      return firstUser.status === "online" ? -1 : 1;
    })
  ), [allUsers]);

  const hasOnlineParticipant = useCallback((chat) => (
    chat?.participants.some((participant) => (
      getParticipantId(participant) !== user?.id && participant.status === "online"
    ))
  ), [user]);

  const isOnline = useCallback((availableUser) => availableUser.status === "online", []);

  return {
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
  };
};

export default useChats;
