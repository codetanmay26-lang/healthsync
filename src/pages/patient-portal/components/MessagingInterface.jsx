import React, { useState, useRef, useEffect } from "react";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { useAuth } from "../../../contexts/AuthContext";
import {
  sendMessage,
  getMessagesBetweenUsers,
  getUserById,
} from "../../../services/localStorageUserManagement";

const MessagingInterface = ({ onMessageSent }) => {
  const { user } = useAuth(); // Get current logged-in user
  const [activeConversation, setActiveConversation] = useState("doctor");
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // Get user's doctor and support contacts
  const [contacts, setContacts] = useState({
    doctor: null,
    support: null,
  });

  // Load contacts on mount
  useEffect(() => {
    if (user && user.role === "patient") {
      const allUsers = JSON.parse(localStorage.getItem("users") || "[]");

      // Find assigned doctor
      const assignedDoctor = allUsers.find(
        (u) => u.id === user.assignedDoctorId && u.role === "doctor"
      );

      // Find support/admin
      const support = allUsers.find((u) => u.role === "admin");

      setContacts({
        doctor: assignedDoctor,
        support: support,
      });

      // Set default conversation to doctor if exists
      if (assignedDoctor) {
        setActiveConversation("doctor");
        loadMessages(assignedDoctor.id);
      }
    }
  }, [user]);

  // Load messages for active conversation
  const loadMessages = (contactId) => {
    if (!user || !contactId) return;

    const conversationMessages = getMessagesBetweenUsers(user.id, contactId);
    setMessages(conversationMessages);
  };

  // Reload messages when conversation changes
  useEffect(() => {
    const contact = contacts[activeConversation];
    if (contact) {
      loadMessages(contact.id);
    }
  }, [activeConversation, contacts, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!newMessage?.trim()) return;

    const contact = contacts[activeConversation];
    if (!contact) return;

    // Send message via user management system
    const result = sendMessage(user.id, contact.id, newMessage);

    if (result.success) {
      // Reload messages
      loadMessages(contact.id);
      setNewMessage("");

      if (onMessageSent) {
        onMessageSent(result.message, activeConversation);
      }

      // Simulate typing indicator and response (optional)
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);

        // Auto-response from contact
        const responses = {
          doctor:
            "Thank you for your message. I'll review this and get back to you shortly.",
          support: "Thanks for reaching out! Let me help you with that.",
        };

        sendMessage(
          contact.id,
          user.id,
          responses[activeConversation] || responses.support
        );
        loadMessages(contact.id);
      }, 2000);
    }
  };

  const handleKeyPress = (e) => {
    if (e?.key === "Enter" && !e?.shiftKey) {
      e?.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp) => {
    const today = new Date();
    const messageDate = new Date(timestamp);

    if (messageDate?.toDateString() === today?.toDateString()) {
      return "Today";
    }

    const yesterday = new Date(today);
    yesterday?.setDate(yesterday?.getDate() - 1);

    if (messageDate?.toDateString() === yesterday?.toDateString()) {
      return "Yesterday";
    }

    return messageDate?.toLocaleDateString();
  };

  const getStatusColor = (status) => {
    return "bg-success"; // All users are online for now
  };

  const currentContact = contacts[activeConversation];

  if (!user || !currentContact) {
    return (
      <div className="bg-surface rounded-lg border border-border p-12 text-center">
        <Icon
          name="MessageCircle"
          size={48}
          className="text-text-secondary/50 mx-auto mb-4"
        />
        <h3 className="text-lg font-medium text-text-primary mb-2">
          No Contacts Available
        </h3>
        <p className="text-text-secondary">
          You don't have any healthcare providers assigned yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text-primary">Messages</h2>
          <Button
            variant="ghost"
            size="sm"
            iconName="Settings"
            iconSize={16}
            className="text-text-secondary hover:text-text-primary"
          />
        </div>

        {/* Conversation Tabs */}
        <div className="flex space-x-1">
          {Object.entries(contacts).map(([key, contact]) => {
            if (!contact) return null;

            return (
              <button
                key={key}
                onClick={() => setActiveConversation(key)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-medical ${
                  activeConversation === key
                    ? "bg-surface text-text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface/50"
                }`}
              >
                <div className="relative">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">
                      {contact.name?.charAt(0)}
                    </span>
                  </div>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface ${getStatusColor(
                      "online"
                    )}`}
                  />
                </div>
                <span>{contact.name?.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Conversation Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-sm text-white font-medium">
                {currentContact.name?.charAt(0)}
              </span>
            </div>
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface ${getStatusColor(
                "online"
              )}`}
            />
          </div>
          <div>
            <h3 className="font-medium text-text-primary">
              {currentContact.name}
            </h3>
            <p className="text-sm text-text-secondary">
              {currentContact.role || currentContact.specialization}
            </p>
            <p className="text-xs text-text-secondary">Active now</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            <Icon
              name="MessageCircle"
              size={48}
              className="mx-auto mb-2 opacity-50"
            />
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isPatient = message.from === user.id;
            const showDate =
              index === 0 ||
              formatDate(message.timestamp) !==
                formatDate(messages[index - 1]?.timestamp);

            return (
              <div key={message.id}>
                {showDate && (
                  <div className="text-center my-4">
                    <span className="text-xs text-text-secondary bg-muted px-3 py-1 rounded-full">
                      {formatDate(message.timestamp)}
                    </span>
                  </div>
                )}

                <div
                  className={`flex ${
                    isPatient ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md ${
                      isPatient ? "order-2" : "order-1"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-lg ${
                        isPatient
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-text-primary"
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                    </div>
                    <p
                      className={`text-xs text-text-secondary mt-1 ${
                        isPatient ? "text-right" : "text-left"
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-text-secondary rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-text-secondary rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e?.target?.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${currentContact.name}...`}
              className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows="2"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              iconName="Paperclip"
              iconSize={16}
              className="text-text-secondary hover:text-text-primary"
              title="Attach file"
            />
            <Button
              variant="default"
              size="icon"
              iconName="Send"
              iconSize={16}
              onClick={handleSendMessage}
              disabled={!newMessage?.trim()}
            />
          </div>
        </div>

        <p className="text-xs text-text-secondary mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default MessagingInterface;
