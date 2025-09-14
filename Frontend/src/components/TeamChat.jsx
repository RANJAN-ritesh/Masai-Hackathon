import React, { useState, useEffect, useRef, useContext } from 'react';
import { MyContext } from '../context/AuthContextProvider';
import { useTheme } from '../context/ThemeContextProvider';
import { useWebSocket } from '../context/WebSocketContextProvider';
import { toast } from 'react-toastify';
import { 
  Send, 
  Image, 
  Paperclip, 
  Edit2, 
  Trash2, 
  MoreVertical,
  Smile,
  Users
} from 'lucide-react';

const TeamChat = ({ currentTeam, hackathon }) => {
  const { userId } = useContext(MyContext);
  const { themeConfig } = useTheme();
  const { registerChatMessageCallback } = useWebSocket();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Check if chat is locked (1 day after hackathon ends)
  const isChatLocked = () => {
    if (!hackathon?.endDate) return false;
    const now = new Date();
    const endDate = new Date(hackathon.endDate);
    const chatEndDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000); // 1 day after
    return now > chatEndDate;
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load messages
  const loadMessages = async (pageNum = 1, append = false) => {
    if (!currentTeam) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/chat/messages/${currentTeam._id}?page=${pageNum}&limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (append) {
          setMessages(prev => [...data.messages, ...prev]);
        } else {
          setMessages(data.messages);
          setTimeout(scrollToBottom, 100);
        }
        setHasMore(data.hasMore);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Send text message
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentTeam || isChatLocked()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/chat/send-message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          teamId: currentTeam._id,
          message: newMessage.trim()
        })
      });
      
      if (response.ok) {
        setNewMessage('');
        // Message will be added via WebSocket callback
      } else {
        const error = await response.json();
        toast.error(error.message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  // Upload file
  const uploadFile = async (file) => {
    if (!file || !currentTeam) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('teamId', currentTeam._id);
      
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/chat/upload-file`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (response.ok) {
        // File will be added via WebSocket callback
      } else {
        const error = await response.json();
        toast.error(error.message);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  // Edit message
  const editMessage = async (messageId, newText) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/chat/edit-message/${messageId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: newText
        })
      });
      
      if (response.ok) {
        setEditingMessage(null);
        setEditText('');
      } else {
        const error = await response.json();
        toast.error(error.message);
      }
    } catch (error) {
      console.error('Error editing message:', error);
      toast.error('Failed to edit message');
    }
  };

  // Delete message
  const deleteMessage = async (messageId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/chat/delete-message/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Message will be removed via WebSocket callback
      } else {
        const error = await response.json();
        toast.error(error.message);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  // Handle file input
  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadFile(file);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString();
  };

  // Load messages on mount
  useEffect(() => {
    loadMessages();
  }, [currentTeam?._id]);

  // Register WebSocket callbacks
  useEffect(() => {
    console.log('🔌 Registering WebSocket callbacks for TeamChat');
    
    const unsubscribeChatMessage = registerChatMessageCallback((chatData) => {
      console.log('💬 Chat message received:', chatData);
      
      if (chatData.type === 'new_message') {
        setMessages(prev => [...prev, chatData.message]);
        setTimeout(scrollToBottom, 100);
      } else if (chatData.type === 'message_edited') {
        setMessages(prev => prev.map(msg => 
          msg._id === chatData.message._id 
            ? { ...msg, message: chatData.message.message, isEdited: true, editedAt: chatData.message.editedAt }
            : msg
        ));
      } else if (chatData.type === 'message_deleted') {
        setMessages(prev => prev.filter(msg => msg._id !== chatData.messageId));
      }
    });

    return () => {
      console.log('🔌 Unregistering WebSocket callbacks for TeamChat');
      unsubscribeChatMessage();
    };
  }, [currentTeam?._id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Check if user is team leader
  const isTeamLeader = currentTeam?.teamLeader?.toString() === userId || currentTeam?.createdBy?.toString() === userId;

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div 
        className="p-4 border-b"
        style={{ 
          backgroundColor: themeConfig.cardBg,
          borderColor: themeConfig.borderColor 
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5" style={{ color: themeConfig.textColor }} />
            <h3 className="font-semibold" style={{ color: themeConfig.textColor }}>
              Team Chat
            </h3>
            <span className="text-sm px-2 py-1 rounded-full" style={{ backgroundColor: themeConfig.accentColor, color: 'white' }}>
              {currentTeam?.teamMembers?.length || 0} members
            </span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{ backgroundColor: themeConfig.backgroundColor }}
      >
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">💬</div>
            <p style={{ color: themeConfig.textColor, opacity: 0.7 }}>
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message._id} className="flex gap-3">
              {/* Avatar */}
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                style={{ 
                  backgroundColor: message.senderId === userId ? themeConfig.accentColor : themeConfig.borderColor,
                  color: message.senderId === userId ? 'white' : themeConfig.textColor
                }}
              >
                {message.senderName?.charAt(0)?.toUpperCase() || 'U'}
              </div>

              {/* Message Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm" style={{ color: themeConfig.textColor }}>
                    {message.senderName}
                    {isTeamLeader && message.senderId === currentTeam?.teamLeader?.toString() && (
                      <span className="ml-1 text-xs px-1 py-0.5 rounded" style={{ backgroundColor: '#fbbf24', color: '#92400e' }}>
                        LEADER
                      </span>
                    )}
                  </span>
                  <span className="text-xs" style={{ color: themeConfig.textColor, opacity: 0.6 }}>
                    {formatTimestamp(message.timestamp)}
                  </span>
                  {message.isEdited && (
                    <span className="text-xs italic" style={{ color: themeConfig.textColor, opacity: 0.6 }}>
                      (edited)
                    </span>
                  )}
                </div>

                {/* Message Body */}
                <div 
                  className="rounded-lg p-3 max-w-md"
                  style={{ 
                    backgroundColor: message.senderId === userId ? themeConfig.accentColor : themeConfig.cardBg,
                    color: message.senderId === userId ? 'white' : themeConfig.textColor
                  }}
                >
                  {message.messageType === 'image' ? (
                    <div>
                      <img 
                        src={message.fileUrl} 
                        alt="Shared image" 
                        className="max-w-full h-auto rounded mb-2 cursor-pointer"
                        onClick={() => window.open(message.fileUrl, '_blank')}
                      />
                      <p>{message.message}</p>
                    </div>
                  ) : message.messageType === 'file' ? (
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4" />
                      <div>
                        <p className="font-medium">{message.fileName}</p>
                        <p className="text-xs opacity-75">{formatFileSize(message.fileSize)}</p>
                      </div>
                      <a 
                        href={message.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-auto px-2 py-1 rounded text-xs"
                        style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                      >
                        Download
                      </a>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.message}</p>
                  )}
                </div>

                {/* Message Actions */}
                {message.senderId === userId && (
                  <div className="flex gap-1 mt-1">
                    <button
                      onClick={() => {
                        setEditingMessage(message._id);
                        setEditText(message.message);
                      }}
                      className="text-xs px-2 py-1 rounded hover:bg-gray-100"
                      style={{ color: themeConfig.textColor, opacity: 0.6 }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteMessage(message._id)}
                      className="text-xs px-2 py-1 rounded hover:bg-gray-100"
                      style={{ color: themeConfig.textColor, opacity: 0.6 }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div 
        className="p-4 border-t"
        style={{ 
          backgroundColor: themeConfig.cardBg,
          borderColor: themeConfig.borderColor 
        }}
      >
        {/* Edit Mode */}
        {editingMessage && (
          <div className="mb-3 p-3 rounded-lg" style={{ backgroundColor: themeConfig.backgroundColor }}>
            <p className="text-sm mb-2" style={{ color: themeConfig.textColor }}>Editing message:</p>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full p-2 rounded border resize-none"
              style={{ 
                backgroundColor: themeConfig.backgroundColor,
                borderColor: themeConfig.borderColor,
                color: themeConfig.textColor
              }}
              rows={2}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => editMessage(editingMessage, editText)}
                className="px-3 py-1 rounded text-sm"
                style={{ backgroundColor: themeConfig.accentColor, color: 'white' }}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditingMessage(null);
                  setEditText('');
                }}
                className="px-3 py-1 rounded text-sm"
                style={{ backgroundColor: themeConfig.borderColor, color: themeConfig.textColor }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Input Area */}
        {isChatLocked() ? (
          <div className="p-4 text-center rounded-lg border-2 border-dashed" style={{ 
            backgroundColor: themeConfig.backgroundColor,
            borderColor: themeConfig.borderColor,
            color: themeConfig.textColor
          }}>
            <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium mb-1">Chat Access Expired</p>
            <p className="text-xs text-gray-500">
              Team chat is no longer available. You can still view your team overview and achievements.
            </p>
          </div>
        ) : (
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="w-full p-3 pr-12 rounded-lg border resize-none"
                style={{ 
                  backgroundColor: themeConfig.backgroundColor,
                  borderColor: themeConfig.borderColor,
                  color: themeConfig.textColor
                }}
                rows={1}
                disabled={loading}
              />
            <div className="absolute right-2 top-2 flex gap-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1 rounded hover:bg-gray-100"
                style={{ color: themeConfig.textColor }}
                disabled={loading}
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1 rounded hover:bg-gray-100"
                style={{ color: themeConfig.textColor }}
                disabled={loading}
              >
                <Image className="w-4 h-4" />
              </button>
            </div>
          </div>
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || loading}
            className="px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: themeConfig.accentColor, color: 'white' }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default TeamChat;
