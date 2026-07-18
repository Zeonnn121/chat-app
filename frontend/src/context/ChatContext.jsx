import { createContext, useContext, useState } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [roomId, setRoomId] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [connected, setConnected] = useState(false);
  const [user, setUser] = useState(() => localStorage.getItem("chatUser") || "");

  const loginUser = (username) => {
    localStorage.setItem("chatUser", username);
    setUser(username);
  };

  const logoutUser = () => {
    localStorage.removeItem("chatUser");
    setUser("");
    setCurrentUser("");
    setRoomId("");
    setConnected(false);
  };

  return (
    <ChatContext.Provider
      value={{
        roomId,
        currentUser,
        connected,
        user,
        setRoomId,
        setCurrentUser,
        setConnected,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => useContext(ChatContext);
