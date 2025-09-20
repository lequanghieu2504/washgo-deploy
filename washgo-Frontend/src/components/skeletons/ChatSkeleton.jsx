import React from "react";

const ChatSkeleton = () => {
  return (
    <div className="chat-skeleton space-y-4 p-4">
      <div className="chat-skeleton-header flex items-center space-x-4">
        <div className="avatar-skeleton w-10 h-10 bg-gray-300 rounded-full"></div>
        <div className="header-text-skeleton w-1/3 h-4 bg-gray-300 rounded"></div>
      </div>
      <div className="chat-skeleton-messages space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className={`message-skeleton w-2/3 h-6 bg-gray-300 rounded ${
              index % 2 === 0 ? "self-start" : "self-end"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default ChatSkeleton;
