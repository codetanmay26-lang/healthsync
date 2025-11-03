import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Image from '../../../components/AppImage';

const ChatMessaging = ({ messages, participants, currentUser, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState('all');
  const [showAttachments, setShowAttachments] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (newMessage?.trim()) {
      onSendMessage({
        content: newMessage,
        recipient: selectedParticipant,
        type: 'text',
        timestamp: new Date()?.toISOString()
      });
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e?.key === 'Enter' && !e?.shiftKey) {
      e?.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      onSendMessage({
        content: `Shared file: ${file?.name}`,
        recipient: selectedParticipant,
        type: 'file',
        attachment: {
          name: file?.name,
          size: file?.size,
          type: file?.type
        },
        timestamp: new Date()?.toISOString()
      });
    }
  };

  const getParticipantRole = (participant) => {
    const roles = {
      'doctor': { icon: 'Stethoscope', color: 'text-primary' },
      'patient': { icon: 'User', color: 'text-accent' },
      'pharmacy': { icon: 'Pill', color: 'text-warning' },
      'nurse': { icon: 'Heart', color: 'text-success' }
    };
    return roles?.[participant?.role] || { icon: 'User', color: 'text-text-secondary' };
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date?.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const renderMessage = (message) => {
    const isCurrentUser = message?.sender === currentUser?.name;
    const participant = participants?.find(p => p?.name === message?.sender);
    const roleInfo = getParticipantRole(participant || {});

    return (
      <div
        key={message?.id}
        className={`flex items-start space-x-3 mb-4 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}
      >
        {/* Avatar */}
        <div className="relative">
          <Image
            src={message?.avatar}
            alt={message?.sender}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center bg-surface ${roleInfo?.color}`}>
            <Icon name={roleInfo?.icon} size={8} />
          </div>
        </div>
        {/* Message Content */}
        <div className={`flex-1 max-w-xs md:max-w-md ${isCurrentUser ? 'text-right' : ''}`}>
          <div className={`inline-block p-3 rounded-lg ${
            isCurrentUser 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-text-primary'
          }`}>
            {message?.type === 'text' && (
              <p className="text-sm whitespace-pre-wrap">{message?.content}</p>
            )}

            {message?.type === 'file' && (
              <div className="flex items-center space-x-2">
                <Icon name="Paperclip" size={16} />
                <div>
                  <p className="text-sm font-medium">{message?.attachment?.name}</p>
                  <p className="text-xs opacity-75">
                    {(message?.attachment?.size / 1024)?.toFixed(1)} KB
                  </p>
                </div>
              </div>
            )}

            {message?.type === 'prescription' && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Icon name="Pill" size={16} />
                  <span className="text-sm font-medium">Prescription Update</span>
                </div>
                <p className="text-sm">{message?.content}</p>
              </div>
            )}

            {message?.type === 'lab_result' && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Icon name="FileText" size={16} />
                  <span className="text-sm font-medium">Lab Result</span>
                </div>
                <p className="text-sm">{message?.content}</p>
              </div>
            )}
          </div>

          <div className={`flex items-center space-x-2 mt-1 text-xs text-text-secondary ${
            isCurrentUser ? 'justify-end' : ''
          }`}>
            <span>{message?.sender}</span>
            <span>•</span>
            <span>{formatMessageTime(message?.timestamp)}</span>
            {message?.urgent && (
              <>
                <span>•</span>
                <Icon name="AlertCircle" size={12} className="text-error" />
                <span className="text-error">Urgent</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-surface border border-border rounded-lg h-96 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon name="MessageCircle" size={20} className="text-primary" />
            <h3 className="font-semibold text-text-primary">Care Team Chat</h3>
          </div>

          {/* Participant Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-text-secondary">Send to:</span>
            <select
              value={selectedParticipant}
              onChange={(e) => setSelectedParticipant(e?.target?.value)}
              className="text-sm border border-border rounded px-2 py-1 bg-surface"
            >
              <option value="all">All Participants</option>
              {participants?.map((participant) => (
                <option key={participant?.id} value={participant?.name}>
                  {participant?.name} ({participant?.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Participants */}
        <div className="flex items-center space-x-2 mt-3">
          <span className="text-xs text-text-secondary">Active:</span>
          {participants?.slice(0, 4)?.map((participant) => {
            const roleInfo = getParticipantRole(participant);
            return (
              <div key={participant?.id} className="relative">
                <Image
                  src={participant?.avatar}
                  alt={participant?.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center bg-surface ${roleInfo?.color}`}>
                  <Icon name={roleInfo?.icon} size={6} />
                </div>
              </div>
            );
          })}
          {participants?.length > 4 && (
            <span className="text-xs text-text-secondary">+{participants?.length - 4} more</span>
          )}
        </div>
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>
      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e?.target?.value)}
              onKeyPress={handleKeyPress}
              className="resize-none"
            />
          </div>

          <div className="flex items-center space-x-1">
            {/* Attachment Button */}
            <Button
              variant="ghost"
              size="icon"
              iconName="Paperclip"
              onClick={() => fileInputRef?.current?.click()}
              className="text-text-secondary hover:text-text-primary"
            />

            {/* Emergency Button */}
            <Button
              variant="ghost"
              size="icon"
              iconName="AlertTriangle"
              className="text-error hover:bg-error/10"
              title="Mark as urgent"
            />

            {/* Send Button */}
            <Button
              variant="default"
              size="icon"
              iconName="Send"
              onClick={handleSendMessage}
              disabled={!newMessage?.trim()}
            />
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileUpload}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />
      </div>
    </div>
  );
};

export default ChatMessaging;