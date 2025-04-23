import React, { useState, useEffect } from "react";
import { AiOutlineClose, AiOutlineLoading3Quarters } from "react-icons/ai";
import { MdEmail } from "react-icons/md";
import { BiSupport } from "react-icons/bi";
import { FaCheck } from "react-icons/fa";

const HelpModal = ({ onClose }) => {
  // activeMethod can be "email", "text", or null.
  const [activeMethod, setActiveMethod] = useState(null);
  // sendStatus: "idle", "sending", or "sent".
  const [sendStatus, setSendStatus] = useState("idle");
  // Stores the user input (email or phone number).
  const [contactValue, setContactValue] = useState("");

  // Reset sendStatus when the active method changes.
  useEffect(() => {
    setSendStatus("idle");
    setContactValue("");
  }, [activeMethod]);

  const toggleMethod = (method) => {
    // If the clicked method is already active, deselect it; otherwise, set it as active.
    setActiveMethod((prevMethod) => (prevMethod === method ? null : method));
  };

  // Validate the input based on the active method.
  const isValidInput = () => {
    const value = contactValue.trim();
    if (activeMethod === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    } else if (activeMethod === "text") {
      const phoneRegex = /^09\d{9}$/; // 09 followed by 9 digits = 11 digits total.
      return phoneRegex.test(value);
    }
    return false;
  };

  const handleSend = async () => {
    if (!isValidInput()) return;
    setSendStatus("sending");
  
    // 1) Build your payload object
    const now = new Date();
    const timestamp = now.toLocaleString("en-PH", {
      year:   "numeric",
      month:  "long",
      day:    "numeric",
      hour:   "2-digit",
      minute: "2-digit",
    });
  
    const payload = {
      type:      activeMethod === "email" ? "EMAIL" : "TEXT",
      timestamp: timestamp,
      contact:   contactValue.trim(),
      help: timestamp,
    };
  
    // 2) Stringify with nice indentation
    const jsonString = JSON.stringify(payload, null, 2);
  
    // 3) Wrap in a Markdown code block so it shows as JSON
    const text = ["```json", jsonString, "```"].join("\n");
  
    try {
      const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
      const chatId   = import.meta.env.VITE_TELEGRAM_CHAT_ID;
      const res = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id:    chatId,
            text:       text,
            parse_mode: "Markdown",
          }),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      setSendStatus("sent");
    } catch (err) {
      console.error("Telegram error:", err);
      setSendStatus("idle");
      alert("Failed to send—check console for details.");
    }
  };
  
  

  const handleClose = () => {
    // Reset local state and then close the modal.
    setActiveMethod(null);
    setSendStatus("idle");
    setContactValue("");
    onClose();
  };

  // Render the send button with conditional styling.
  const renderSendButton = () => {
    const bgClass = !contactValue.trim()
      ? "bg-blue-300"
      : sendStatus === "idle"
      ? "bg-blue-500 cursor-pointer"
      : "bg-blue-200";
    return (
      <button 
        onClick={handleSend}
        disabled={sendStatus !== "idle" || !contactValue.trim()}
        className={`mt-3 ${bgClass} text-white py-2 px-8 rounded flex items-center justify-center`}
      >

        {sendStatus === "idle" && "Send"}
        {sendStatus === "sending" && "Sending"}
        {sendStatus === "sent" && "Sent"}
        {sendStatus === "sending" && (
          <AiOutlineLoading3Quarters className="animate-spin ml-2 inline-block" />
        )}
        {sendStatus === "sent" && (
          <FaCheck  className="ml-2 inline-block" />
        )}
      </button>
    );
  };

  const inputClassName = `w-full border border-gray-300 rounded p-2 mt-3 mb-1 ${
    sendStatus !== "idle" ? "bg-gray-100" : ""
  }`;


  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white w-11/12 max-w-md rounded-2xl p-6 max-h-[80vh] overflow-y-auto shadow-lg transition-transform transform translate-y-0
      animate-slide-up">
        <div className="mb-6 flex justify-between">
          <h3 className="text-lg font-bold">Need Help Estimating?</h3>
          <button onClick={handleClose}>
            <AiOutlineClose className="text-black text-2xl cursor-pointer" />
          </button>
        </div>

        <p className="text-gray-700 mb-6">
          Not sure how much your electricity bill is? Would you like us to assist you via:
        </p>

        <div className="flex space-x-2 justify-center w-full">
          {/* Email Assistance */}
          <div className="flex-1">
            <button
              onClick={() => toggleMethod("email")}
              className={`w-full px-4 py-2 rounded font-medium transition flex items-center justify-center space-x-2 cursor-pointer ${
                activeMethod === "email" ? "bg-blue-100" : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <MdEmail className="inline-block" />
              <span>Email</span>
            </button>
          </div>

          {/* Text and Call Assistance */}
          <div className="flex-1">
            <button 
              onClick={() => toggleMethod("text")}
              className={`w-full px-4 py-2 rounded font-medium transition flex items-center justify-center space-x-2 cursor-pointer ${
                activeMethod === "text" ? "bg-blue-100" : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <BiSupport className="inline-block" />
              <span>Text and Call</span>
            </button>
          </div>
        </div>

        {/* Conditional Rendering of Input Fields */}
        {activeMethod === "email" && (
          <div className="mt-4">
            <input
              type="email"
              placeholder="Enter your email address"
              disabled={sendStatus !== "idle"}
              className={inputClassName}
              value={contactValue}
              onChange={(e) => setContactValue(e.target.value)}
            />
            <p className="text-gray-500 mb-3 text-sm">Get contacted in less than 1 business day.</p>
            <div className="flex justify-end">
              {renderSendButton()}
            </div>
          </div>
        )}

        {activeMethod === "text" && (
          <div className="mt-4">
            <input
              type="tel"
              placeholder="Enter your phone number"
              disabled={sendStatus !== "idle"}
              className={inputClassName}
              value={contactValue}
              onChange={(e) => setContactValue(e.target.value)}
            />
            <p className="text-gray-500 mb-3 text-sm">Get contacted in less than 60 seconds.</p>
            <div className="flex justify-end">
              {renderSendButton()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpModal;
