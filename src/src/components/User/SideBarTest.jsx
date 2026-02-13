import React from "react";
import { FaSyncAlt, FaEnvelope } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";

const SideBarTest = ({
  chatWindowRef,
  chatMessages,
  chatInput,
  setChatInput,
  handleChatBotOne,
  loadingEmail,
  customerLoaded,
}) => {
  const WhatsAppBubble = ({ msg }) => (
    <div
      className={`userdashboard-bubble ${
        msg.sender === "user"
          ? "userdashboard-bubble-user"
          : "userdashboard-bubble-bot"
      }`}
    >
      <ReactMarkdown>{msg.text}</ReactMarkdown>
      <div className="userdashboard-timestamp">{msg.timestamp}</div>
    </div>
  );
  return (
    <div>
      <div id="sidebar">
        <div>
          <h3 style={{ paddingTop: "26px" }}>Control Panel</h3>
          <div className="chatbot-container" style={{ marginTop: "20px" }}>
            <h3>Assistant Chat</h3>
            <br />
            <div className="chat-window-ref" ref={chatWindowRef}>
              {chatMessages.map((msg, idx) => (
                <WhatsAppBubble msg={msg} key={idx} />
              ))}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "10px",
                background: "#fff",
                padding: "8px",
                borderRadius: "10px",
              }}
            >
              <input
                type="text"
                placeholder="Type a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleChatBotOne();
                  }
                }}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  background: "#f0f0f0",
                  borderRadius: "25px",
                  border: "none",
                  outline: "none",
                }}
              />

              <button
                onClick={handleChatBotOne}
                style={{
                  width: "auto",
                  borderRadius: "50%",
                  background: "#128C7E",
                  border: "none",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <IoMdSend />
              </button>
            </div>
          </div>
        </div>

        <div>
          <h3>Send Summary Email</h3>
          <button disabled={loadingEmail || !customerLoaded}>
            {loadingEmail ? (
              <>
                <FaSyncAlt className="spin" /> Sending...
              </>
            ) : (
              <>
                <FaEnvelope /> Send Email to Customer
              </>
            )}
          </button>
        </div>

        <div className="list-group list-group-flush">
          <Link
            to="#"
            onClick={() => handleLogout()}
            className="list-group-item list-group-item-action p-3"
          >
            <i className="bi bi-box-arrow-right me-2 text-danger"></i> Log Out
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SideBarTest;
