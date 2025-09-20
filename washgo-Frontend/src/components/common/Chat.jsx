import React, { useState, useEffect, useRef } from "react";
import { connectWebSocket, sendMessage } from "@/utils/websocket";
import {
  getChatSessions,
  getSessionMessages,
} from "@/entities/service/ChatService";

function getOtherUsername(session, currentUser) {
  return session.participant1Username === currentUser
    ? session.participant2Username
    : session.participant1Username;
}

export function Chat({ currentUser }) {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showAddChat, setShowAddChat] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [addChatError, setAddChatError] = useState("");
  const selectedSessionRef = useRef(selectedSession);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    connectWebSocket(handleIncomingMessage, currentUser);
    getChatSessions().then(setSessions);
    // eslint-disable-next-line
  }, [currentUser]);

  useEffect(() => {
    selectedSessionRef.current = selectedSession;
  }, [selectedSession]);

  useEffect(() => {
    // Always scroll to bottom when messages change
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  function handleIncomingMessage(msg) {
    if (
      selectedSessionRef.current &&
      msg.sessionId === selectedSessionRef.current.id
    ) {
      setMessages((prev) => [...prev, msg]);
    }
  }

  const handleSelectSession = async (session) => {
    setSelectedSession(session);
    const msgs = await getSessionMessages(session.id);
    setMessages(msgs);
  };

  const handleSend = () => {
    if (!selectedSession || !input.trim()) return;
    sendMessage({
      senderUsername: currentUser,
      recipientUsername: getOtherUsername(selectedSession, currentUser),
      content: input,
      sessionId: selectedSession.id,
    });

    setInput("");
  };

  // Add new chat logic
  const handleAddChat = async () => {
    setAddChatError("");
    if (!newChatName.trim()) {
      setAddChatError("Please enter a username.");
      return;
    }
    try {
      const res = await fetch("http://localhost:8080/api/chat/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ recipientUsername: newChatName.trim() }),
      });
      if (!res.ok) {
        if (res.status === 403) {
          setAddChatError("User does not exist or cannot chat.");
        } else {
          setAddChatError("Failed to create chat session.");
        }
        return;
      }
      const session = await res.json();
      // Add to sessions if not already present
      setSessions((prev) => {
        const exists = prev.some((s) => s.id === session.id);
        return exists ? prev : [session, ...prev];
      });
      setSelectedSession(session);
      setShowAddChat(false);
      setNewChatName("");
      setAddChatError("");
      // Optionally, fetch messages for the new session
      const msgs = await getSessionMessages(session.id);
      setMessages(msgs);
    } catch (err) {
      setAddChatError("Network error. Please try again.");
    }
  };

  return (
    <div className="w-[350px] bg-white rounded-xl shadow-lg flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[#cc0000] text-white px-4 py-3 font-semibold text-lg flex items-center justify-between">
        {selectedSession
          ? `Chat with ${getOtherUsername(selectedSession, currentUser)}`
          : "Select a conversation"}
        <button
          className="ml-2 px-2 py-1 bg-white text-[#cc0000] rounded text-xs font-bold border border-[#cc0000] hover:bg-red-50"
          onClick={() => {
            setShowAddChat((prev) => !prev);
            setAddChatError("");
            setNewChatName("");
          }}
        >
          + New Chat
        </button>
      </div>
      {/* Add Chat Input */}
      {showAddChat && (
        <div className="p-3 border-b border-gray-100 bg-gray-50 flex flex-col gap-2">
          <input
            type="text"
            className="border rounded px-3 py-2 text-sm"
            placeholder="Enter username to chat"
            value={newChatName}
            onChange={(e) => setNewChatName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddChat();
            }}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              className="bg-[#cc0000] text-white px-3 py-1 rounded text-sm"
              onClick={handleAddChat}
            >
              Start Chat
            </button>
            <button
              className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm"
              onClick={() => setShowAddChat(false)}
            >
              Cancel
            </button>
          </div>
          {addChatError && (
            <div className="text-red-600 text-xs mt-1">{addChatError}</div>
          )}
        </div>
      )}
      <div className="flex min-h-[320px] max-h-[400px]">
        {/* Session List */}
        <ul className="w-28 border-r border-gray-100 bg-gray-50 overflow-y-auto">
          {sessions.map((s) => (
            <li
              key={s.id}
              onClick={() => handleSelectSession(s)}
              className={`px-3 py-2 cursor-pointer truncate ${
                selectedSession && selectedSession.id === s.id
                  ? "bg-red-50 font-bold text-[#cc0000]"
                  : "hover:bg-gray-100"
              }`}
            >
              {getOtherUsername(s, currentUser)}
            </li>
          ))}
        </ul>
        {/* Chat Area */}
        <div className="flex flex-col flex-1">
          <div
            ref={chatBoxRef}
            className="flex-1 px-3 py-2 overflow-y-auto bg-gray-50 text-sm flex flex-col gap-2"
            style={{ minHeight: 0, maxHeight: 300 }}
          >
            {selectedSession ? (
              messages.length === 0 ? (
                <div className="text-gray-400 text-center mt-8">
                  No messages yet.
                </div>
              ) : (
                messages.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className={`max-w-[80%] px-3 py-2 rounded-2xl mb-1 ${
                      m.senderUsername === currentUser
                        ? "bg-[#cc0000] text-white self-end"
                        : "bg-gray-200 text-gray-800 self-start"
                    }`}
                  >
                    <span className="block font-semibold text-xs mb-1">
                      {m.senderUsername === currentUser
                        ? "You"
                        : m.senderUsername}
                    </span>
                    <span>{m.content}</span>
                  </div>
                ))
              )
            ) : (
              <div className="text-gray-400 text-center mt-8">
                Select a conversation to start chatting.
              </div>
            )}
          </div>
          {/* Input Area */}
          <div className="border-t border-gray-100 bg-white px-3 py-2 flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-2xl border border-gray-200 px-4 py-2 text-sm outline-none bg-gray-50"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              disabled={!selectedSession}
            />
            <button
              onClick={handleSend}
              className={`rounded-2xl px-5 py-2 font-semibold text-sm transition ${
                selectedSession && input.trim()
                  ? "bg-[#cc0000] text-white hover:bg-[#a30000]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              disabled={!selectedSession || !input.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
