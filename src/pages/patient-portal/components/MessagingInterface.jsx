import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const MessagingInterface = ({ onMessageSent }) => {
  const [activeConversation, setActiveConversation] = useState('doctor');
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const conversations = {
    doctor: {
      id: 'doctor',
      name: 'Dr. Sarah Johnson',
      role: 'Primary Care Physician',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
      status: 'online',
      lastSeen: 'Active now',
      messages: [
        {
          id: 1,
          sender: 'doctor',
          content: "Hello! I\'ve reviewed your latest lab results. Your glucose levels are slightly elevated. Let\'s discuss some dietary adjustments.",
          timestamp: new Date(2025, 8, 8, 9, 30),
          type: 'text'
        },
        {
          id: 2,
          sender: 'patient',
          content: "Thank you for reviewing them so quickly. What specific changes should I make to my diet?",
          timestamp: new Date(2025, 8, 8, 10, 15),
          type: 'text'
        },
        {
          id: 3,
          sender: 'doctor',
          content: "I recommend reducing refined carbohydrates and increasing fiber intake. I'll send you a detailed meal plan. Also, let's schedule a follow-up in 2 weeks.",
          timestamp: new Date(2025, 8, 8, 10, 45),
          type: 'text'
        },
        {
          id: 4,
          sender: 'doctor',
          content: "meal_plan_diabetes.pdf",
          timestamp: new Date(2025, 8, 8, 10, 46),
          type: 'file',
          fileName: 'Diabetes Meal Plan',
          fileSize: '2.3 MB'
        }
      ]
    },
    pharmacy: {
      id: 'pharmacy',
      name: 'HealthSync Pharmacy',
      role: 'Pharmacy Team',
      avatar: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=150&h=150&fit=crop',
      status: 'online',
      lastSeen: '2 hours ago',
      messages: [
        {
          id: 1,
          sender: 'pharmacy',
          content: "Your prescription for Metformin is ready for pickup. We\'re open until 10 PM today.",
          timestamp: new Date(2025, 8, 8, 14, 20),
          type: 'text'
        },
        {
          id: 2,
          sender: 'patient',
          content: "Great! Can I get it delivered instead? I\'m not feeling well today.",
          timestamp: new Date(2025, 8, 8, 14, 25),
          type: 'text'
        },
        {
          id: 3,
          sender: 'pharmacy',
          content: "Absolutely! We can deliver it within 2 hours for a $5 delivery fee. Would you like to proceed?",
          timestamp: new Date(2025, 8, 8, 14, 30),
          type: 'text'
        }
      ]
    },
    support: {
      id: 'support',
      name: 'HealthSync Support',
      role: 'Technical Support',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      status: 'online',
      lastSeen: 'Active now',
      messages: [
        {
          id: 1,
          sender: 'support',
          content: "Hi! I\'m here to help with any questions about using the HealthSync app. How can I assist you today?",
          timestamp: new Date(2025, 8, 8, 16, 0),
          type: 'text'
        }
      ]
    }
  };

  const currentConversation = conversations?.[activeConversation];

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages, activeConversation]);

  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage?.trim()) return;

    const message = {
      id: Date.now(),
      sender: 'patient',
      content: newMessage,
      timestamp: new Date(),
      type: 'text'
    };

    // Add message to conversation
    conversations?.[activeConversation]?.messages?.push(message);

    if (onMessageSent) {
      onMessageSent(message, activeConversation);
    }

    setNewMessage('');

    // Simulate typing indicator and response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      
      // Add mock response
      const responses = {
        doctor: "Thank you for your message. I\'ll review this and get back to you shortly.",
        pharmacy: "Got it! We\'ll process your request right away.",
        support: "Thanks for reaching out! Let me help you with that."
      };

      const response = {
        id: Date.now() + 1,
        sender: activeConversation,
        content: responses?.[activeConversation],
        timestamp: new Date(),
        type: 'text'
      };

      conversations?.[activeConversation]?.messages?.push(response);
      scrollToBottom();
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e?.key === 'Enter' && !e?.shiftKey) {
      e?.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const today = new Date();
    const messageDate = new Date(timestamp);
    
    if (messageDate?.toDateString() === today?.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday?.setDate(yesterday?.getDate() - 1);
    
    if (messageDate?.toDateString() === yesterday?.toDateString()) {
      return 'Yesterday';
    }
    
    return messageDate?.toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-success';
      case 'away': return 'bg-warning';
      case 'offline': return 'bg-error';
      default: return 'bg-text-secondary';
    }
  };

  const downloadFile = (fileName) => {
    // In a real app, this would download the file
    alert(`Downloading ${fileName}...`);
  };

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
          {Object.values(conversations)?.map((conv) => (
            <button
              key={conv?.id}
              onClick={() => setActiveConversation(conv?.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-medical ${
                activeConversation === conv?.id
                  ? 'bg-surface text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface/50'
              }`}
            >
              <div className="relative">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-medium">
                    {conv?.name?.charAt(0)}
                  </span>
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface ${getStatusColor(conv?.status)}`} />
              </div>
              <span>{conv?.name?.split(' ')?.[0]}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Current Conversation Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-sm text-white font-medium">
                {currentConversation?.name?.charAt(0)}
              </span>
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface ${getStatusColor(currentConversation?.status)}`} />
          </div>
          <div>
            <h3 className="font-medium text-text-primary">{currentConversation?.name}</h3>
            <p className="text-sm text-text-secondary">{currentConversation?.role}</p>
            <p className="text-xs text-text-secondary">{currentConversation?.lastSeen}</p>
          </div>
        </div>
      </div>
      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {currentConversation?.messages?.map((message, index) => {
          const isPatient = message?.sender === 'patient';
          const showDate = index === 0 || 
            formatDate(message?.timestamp) !== formatDate(currentConversation?.messages?.[index - 1]?.timestamp);

          return (
            <div key={message?.id}>
              {showDate && (
                <div className="text-center my-4">
                  <span className="text-xs text-text-secondary bg-muted px-3 py-1 rounded-full">
                    {formatDate(message?.timestamp)}
                  </span>
                </div>
              )}
              <div className={`flex ${isPatient ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md ${isPatient ? 'order-2' : 'order-1'}`}>
                  {message?.type === 'text' ? (
                    <div className={`p-3 rounded-lg ${
                      isPatient 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-text-primary'
                    }`}>
                      <p className="text-sm">{message?.content}</p>
                    </div>
                  ) : message?.type === 'file' ? (
                    <div className={`p-3 rounded-lg border ${
                      isPatient 
                        ? 'bg-primary/10 border-primary' :'bg-muted border-border'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icon name="FileText" size={20} className="text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-text-primary">{message?.fileName}</p>
                          <p className="text-xs text-text-secondary">{message?.fileSize}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          iconName="Download"
                          iconSize={16}
                          onClick={() => downloadFile(message?.fileName)}
                          className="text-primary hover:bg-primary/10"
                        />
                      </div>
                    </div>
                  ) : null}
                  
                  <p className={`text-xs text-text-secondary mt-1 ${
                    isPatient ? 'text-right' : 'text-left'
                  }`}>
                    {formatTime(message?.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
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
              placeholder={`Message ${currentConversation?.name}...`}
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