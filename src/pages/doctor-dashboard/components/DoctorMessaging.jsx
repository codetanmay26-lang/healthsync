import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  getDoctorPatients, 
  getMessagesBetweenUsers, 
  sendMessage 
} from '../../../services/localStorageUserManagement';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DoctorMessaging = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

// Load patients on mount
useEffect(() => {
  if (user && user.role === 'doctor') {
    const assignedPatients = getDoctorPatients(user.id);
    setPatients(assignedPatients);
    
    // Check if there's a selected patient from "Send Message" button
    const selectedPatientId = sessionStorage.getItem('selectedPatientId');
    
    if (selectedPatientId) {
      // Find and select the patient from the button click
      const patient = assignedPatients.find(p => p.id === selectedPatientId);
      if (patient) {
        setSelectedPatient(patient);
      }
      // Clear sessionStorage after using (so it doesn't persist)
      sessionStorage.removeItem('selectedPatientId');
    } else if (assignedPatients.length > 0) {
      // Default: select first patient
      setSelectedPatient(assignedPatients[0]);
    }
  }
}, [user]);

  // Load messages when patient changes
  useEffect(() => {
    if (selectedPatient && user) {
      loadMessages();
    }
  }, [selectedPatient, user]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = () => {
    if (!selectedPatient || !user) return;
    const patientMessages = getMessagesBetweenUsers(user.id, selectedPatient.id);
    setMessages(patientMessages);
  };

  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedPatient) return;
    
    const result = sendMessage(user.id, selectedPatient.id, newMessage);
    
    if (result.success) {
      setNewMessage('');
      loadMessages();
      
      // Simulate typing indicator
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
      }, 1500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp) => {
    const today = new Date();
    const messageDate = new Date(timestamp);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return messageDate.toLocaleDateString();
  };

  if (!user || user.role !== 'doctor') {
    return (
      <div className="bg-surface border border-border rounded-lg p-12 text-center">
        <Icon name="AlertCircle" size={48} className="text-error mx-auto mb-4" />
        <h3 className="text-lg font-medium text-text-primary mb-2">Access Denied</h3>
        <p className="text-text-secondary">You must be logged in as a doctor to access messaging.</p>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-lg p-12 text-center">
        <Icon name="Users" size={48} className="text-text-secondary/50 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-text-primary mb-2">No Patients Assigned</h3>
        <p className="text-text-secondary">
          You don't have any patients assigned to you yet. Contact your administrator to assign patients.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Patient List Sidebar */}
      <div className="lg:col-span-1 bg-surface border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border bg-muted">
          <h3 className="font-semibold text-text-primary">Your Patients ({patients.length})</h3>
          <p className="text-xs text-text-secondary mt-1">Select a patient to message</p>
        </div>
        
        <div className="overflow-y-auto max-h-[600px]">
          {patients.map(patient => {
            const patientMessages = getMessagesBetweenUsers(user.id, patient.id);
            const unreadCount = patientMessages.filter(m => 
              !m.read && m.from === patient.id
            ).length;
            const lastMessage = patientMessages[patientMessages.length - 1];

            return (
              <button
                key={patient.id}
                onClick={() => setSelectedPatient(patient)}
                className={`w-full text-left p-4 border-b border-border transition-medical hover:bg-muted/50 ${
                  selectedPatient?.id === patient.id
                    ? 'bg-primary/10 border-l-4 border-l-primary'
                    : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {patient.name?.charAt(0)}
                      </span>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-surface" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-text-primary truncate">
                        {patient.name}
                      </div>
                      {unreadCount > 0 && (
                        <span className="bg-error text-white text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-text-secondary truncate">
                      {lastMessage ? lastMessage.message : 'No messages yet'}
                    </div>
                    {lastMessage && (
                      <div className="text-xs text-text-secondary/70 mt-1">
                        {formatTime(lastMessage.timestamp)}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-3 bg-surface border border-border rounded-lg flex flex-col">
        {selectedPatient ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-muted">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-lg font-medium text-primary">
                      {selectedPatient.name?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">{selectedPatient.name}</h3>
                    <div className="text-sm text-text-secondary">
                      <span className="inline-flex items-center">
                        <span className="w-2 h-2 bg-success rounded-full mr-2"></span>
                        Active now
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="Phone"
                    iconSize={16}
                    className="text-text-secondary hover:text-text-primary"
                    title="Call patient"
                    onClick={() => alert(`Calling ${selectedPatient.name}...`)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="Video"
                    iconSize={16}
                    className="text-text-secondary hover:text-text-primary"
                    title="Video call"
                    onClick={() => alert('Video call feature coming soon!')}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="FileText"
                    iconSize={16}
                    className="text-text-secondary hover:text-text-primary"
                    title="View patient profile"
                    onClick={() => window.location.href = `/patient-profile?id=${selectedPatient.id}`}
                  />
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px] max-h-[500px]">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <Icon name="MessageCircle" size={48} className="text-text-secondary/50 mb-3" />
                  <p className="text-text-secondary">No messages yet</p>
                  <p className="text-sm text-text-secondary/70 mt-1">
                    Start the conversation with {selectedPatient.name}
                  </p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isDoctor = message.from === user.id;
                  const showDate = index === 0 || 
                    formatDate(message.timestamp) !== formatDate(messages[index - 1]?.timestamp);

                  return (
                    <div key={message.id}>
                      {showDate && (
                        <div className="text-center my-4">
                          <span className="text-xs text-text-secondary bg-muted px-3 py-1 rounded-full">
                            {formatDate(message.timestamp)}
                          </span>
                        </div>
                      )}

                      <div className={`flex ${isDoctor ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-md ${isDoctor ? 'order-2' : 'order-1'}`}>
                          <div className={`p-3 rounded-lg ${
                            isDoctor
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-text-primary'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                          </div>
                          <p className={`text-xs text-text-secondary mt-1 ${
                            isDoctor ? 'text-right' : 'text-left'
                          }`}>
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
                      <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-muted">
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message ${selectedPatient.name}...`}
                    className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-input text-text-primary"
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
                    onClick={() => alert('File attachment coming soon!')}
                  />
                  <Button
                    variant="default"
                    size="icon"
                    iconName="Send"
                    iconSize={16}
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  />
                </div>
              </div>

              <p className="text-xs text-text-secondary mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full p-12 text-center">
            <div>
              <Icon name="MessageCircle" size={48} className="text-text-secondary/50 mx-auto mb-3" />
              <p className="text-text-secondary">Select a patient to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorMessaging;
