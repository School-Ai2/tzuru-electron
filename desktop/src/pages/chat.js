function renderChatPage(container) {
  console.log('Rendering chat page with userData:', userData);
  console.log('Active document ID:', userData.activeDocumentId);
  
  if (userData.activeDocumentId) {
      // Verify the document still exists in main process
      window.electronAPI.documentExists({
        userId: userData.email || 'default-user',
        documentId: userData.activeDocumentId
      })
      .then(exists => {
        if (!exists) {
          console.log('Referenced document does not exist, clearing reference');
          userData.activeDocumentId = null;
        }
      })
      .catch(err => {
        console.error('Error checking document existence:', err);
        // On error, assume document doesn't exist for safety
        userData.activeDocumentId = null;
      });
    }
  // Initial message
  const initialMessage = {
    sender: 'ai',
    content: `Welcome to Tzuru! I'm your AI learning assistant. How can I help you today?`,
    timestamp: new Date()
  };
  
  // Initialize messages array
  const messages = [initialMessage];
  
  container.innerHTML = `
    <div class="chat-container">
      <div class="chat-sidebar">
        <div style="text-align: center; padding: 15px 0;">
          <img src="./src/assets/images/logo.png" alt="Tzuru Logo" style="width: 40px; height: 40px;">
          <h2 style="color: #4A2707; margin-top: 10px;">Tzuru</h2>
          <p style="color: #4A2707; font-size: 14px; margin-top: 5px;">
            Your AI Learning Assistant
          </p>
        </div>
        
        <div style="margin-top: 30px;">
          <div style="padding: 10px 20px; background-color: rgba(244, 120, 52, 0.2); border-left: 3px solid #F47834;">
            <span style="color: #4A2707; font-weight: bold;">Chat</span>
          </div>
          
          ${userData.userType === 'individual' ? `
            <div style="padding: 10px 20px; margin-top: 10px; cursor: pointer;" id="documents-nav">
              <span style="color: #4A2707;">My Documents</span>
            </div>
            <div style="padding: 10px 20px; margin-top: 10px; cursor: pointer;" id="settings-nav">
              <span style="color: #4A2707;">Settings</span>
            </div>
          ` : userData.userType === 'teacher' ? `
            <div style="padding: 10px 20px; margin-top: 10px; cursor: pointer;">
              <span style="color: #4A2707;">Lesson Plans</span>
            </div>
            <div style="padding: 10px 20px; margin-top: 10px; cursor: pointer;">
              <span style="color: #4A2707;">Class Management</span>
            </div>
          ` : ''}
        </div>
        
        <div style="position: absolute; bottom: 20px; left: 20px; max-width: 210px;">
          <div style="padding: 15px; background-color: rgba(244, 120, 52, 0.2); border-radius: 8px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center;">
                <div style="width: 36px; height: 36px; border-radius: 50%; background-color: #F47834; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                  <span style="color: white;">${userData.email ? userData.email.charAt(0).toUpperCase() : 'U'}</span>
                </div>
                <div>
                  <p style="color: #4A2707; font-size: 14px; margin: 0;">${userData.email || 'User'}</p>
                  <p style="color: #4A2707; font-size: 12px; margin: 0;">
                    ${userData.userType ? userData.userType.charAt(0).toUpperCase() + userData.userType.slice(1) : 'User'}
                  </p>
                </div>
              </div>
              <button 
                onclick="window.logout()" 
                style="padding: 6px 16px; background-color: transparent; color: #F47834; border: 1px solid #F47834; border-radius: 4px; cursor: pointer; font-size: 12px; transition: all 0.2s;"
                onmouseover="this.style.backgroundColor='#F47834'; this.style.color='white';"
                onmouseout="this.style.backgroundColor='transparent'; this.style.color='#F47834';"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
        
        <div class="status-container" style="position: absolute; bottom: 20px; left: 20px; width: calc(100% - 40px); display: flex; align-items: center; pointer-events: none;">
          <div class="status-indicator" style="width: 10px; height: 10px; border-radius: 50%; background-color: #dc3545; margin-right: 10px;"></div>
          <span class="status-text" style="font-size: 12px; color: #4A2707;">Checking Ollama connection...</span>
        </div>
      </div>
      
      <div class="chat-main">
        <div class="chat-messages" id="chat-messages">
          <!-- Messages will be rendered here -->
        </div>
        
        <form class="chat-input-container" id="chat-form">
          <input
            type="text"
            class="chat-input"
            id="chat-input"
            placeholder="Type your message here..."
          />
          <button 
            type="submit" 
            class="btn"
            id="send-btn"
            disabled
            style="opacity: 0.6; cursor: not-allowed;"
          >
            Send
          </button>
        </form>
      </div>
    </div>
    
    <style>
      @keyframes typingAnimation {
        0% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
        100% { transform: translateY(0); }
      }
    </style>
  `;
  
  // Render initial messages
  renderMessages();
  
  // Get DOM elements
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');
  const chatForm = document.getElementById('chat-form');
  const chatMessages = document.getElementById('chat-messages');
  
  // Set up navigation handlers
  if (userData.userType === 'individual') {
    const documentsNav = document.getElementById('documents-nav');
    const settingsNav = document.getElementById('settings-nav');
    
    if (documentsNav) {
      documentsNav.addEventListener('click', () => {
        console.log('Navigating to documents page');
        navigateToPage('documents');
      });
    } else {
      console.error('Documents navigation element not found');
    }
    
    if (settingsNav) {
      settingsNav.addEventListener('click', () => {
        console.log('Navigating to settings page');
        navigateToPage('settings');
      });
    } else {
      console.error('Settings navigation element not found');
    }
  }
  
  // Initialize connection manager - use the global one
  const connectionManager = new window.ConnectionManager();
  connectionManager.init();
  
  class MessageHandler {
    constructor(connectionManager) {
      this.connectionManager = connectionManager;
      this.chatMessages = document.getElementById('chat-messages');
      this.chatInput = document.getElementById('chat-input');
      this.sendBtn = document.getElementById('send-btn');
      this.currentConversationId = 'default';
      
      // Get active document ID if available - add debug log
      console.log('userData in chat page:', userData);
      this.activeDocumentId = userData.activeDocumentId || null;
      console.log('Active document ID in chat:', this.activeDocumentId);
      
      // Show active document notification if one is selected
      if (this.activeDocumentId) {
        this.showActiveDocumentNotification();
      }
    }
    
    init() {
      // Initialize event listeners
      this.setupEventListeners();
    }
    
    setupEventListeners() {
      if (this.sendBtn) {
        this.sendBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.sendMessage();
        });
      }
      
      if (this.chatInput) {
        this.chatInput.addEventListener('keypress', (event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
          }
        });
        
        // Enable/disable send button based on input
        this.chatInput.addEventListener('input', () => {
          if (this.chatInput.value.trim()) {
            this.sendBtn.disabled = false;
            this.sendBtn.style.opacity = '1';
            this.sendBtn.style.cursor = 'pointer';
          } else {
            this.sendBtn.disabled = true;
            this.sendBtn.style.opacity = '0.6';
            this.sendBtn.style.cursor = 'not-allowed';
          }
        });
      }
    }
    
    // Show notification about active document
    showActiveDocumentNotification() {
      console.log('Showing active document notification');
      
      const notification = document.createElement('div');
      notification.className = 'document-notification';
      notification.style.backgroundColor = 'rgba(244, 120, 52, 0.1)';
      notification.style.padding = '10px 15px';
      notification.style.borderRadius = '8px';
      notification.style.marginBottom = '20px';
      notification.style.display = 'flex';
      notification.style.alignItems = 'center';
      notification.style.justifyContent = 'space-between';
      
      const notificationText = document.createElement('div');
      notificationText.innerHTML = `
        <p style="margin: 0; color: #4A2707; font-weight: bold;">Active Document</p>
        <p style="margin: 0; font-size: 14px; color: #666;">Tzuru will use this document to enhance responses</p>
      `;
      
      const clearBtn = document.createElement('button');
      clearBtn.textContent = 'Clear';
      clearBtn.className = 'btn btn-secondary';
      clearBtn.style.padding = '5px 10px';
      clearBtn.style.fontSize = '12px';
      clearBtn.addEventListener('click', () => {
        this.activeDocumentId = null;
        userData.activeDocumentId = null;
        notification.remove();
        console.log('Document context cleared');
      });
      
      notification.appendChild(notificationText);
      notification.appendChild(clearBtn);
      
      // Make sure the chat messages element exists before trying to append
      if (this.chatMessages) {
        this.chatMessages.insertAdjacentElement('afterbegin', notification);
      } else {
        console.error('Chat messages element not found');
      }
    }
    
    // Add a message to the chat
    addMessage(content, isUser = false) {
      const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const messageHtml = `
        <div class="message ${isUser ? 'message-user' : 'message-ai'}" style="align-self: ${isUser ? 'flex-end' : 'flex-start'};">
          <div style="background-color: ${isUser ? '#F47834' : '#E0E0E0'}; color: ${isUser ? 'white' : '#333'}; padding: 12px 16px; border-radius: ${isUser ? '18px 18px 0 18px' : '18px 18px 18px 0'}; max-width: 80%; margin-left: ${isUser ? 'auto' : '0'};">
            ${content}
          </div>
          <span style="font-size: 12px; color: #999; margin-top: 5px; align-self: ${isUser ? 'flex-end' : 'flex-start'}; padding: 0 5px; ${isUser ? 'text-align: right; display: block;' : ''}">
            ${formattedTime}
          </span>
        </div>
      `;
      
      this.chatMessages.innerHTML += messageHtml;
      
      // Scroll to bottom
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    // Show typing indicator
    showTypingIndicator() {
      const typingIndicator = document.createElement('div');
      typingIndicator.id = 'typing-indicator';
      typingIndicator.className = 'message message-ai';
      typingIndicator.style.alignSelf = 'flex-start';
      
      typingIndicator.innerHTML = `
        <div style="display: flex; gap: 3px; padding: 8px 16px; background-color: #E0E0E0; border-radius: 18px 18px 18px 0;">
          <div class="typing-dot" style="width: 8px; height: 8px; background-color: #999; border-radius: 50%; animation: typingAnimation 1s infinite ease-in-out; animation-delay: 0s;"></div>
          <div class="typing-dot" style="width: 8px; height: 8px; background-color: #999; border-radius: 50%; animation: typingAnimation 1s infinite ease-in-out; animation-delay: 0.2s;"></div>
          <div class="typing-dot" style="width: 8px; height: 8px; background-color: #999; border-radius: 50%; animation: typingAnimation 1s infinite ease-in-out; animation-delay: 0.4s;"></div>
        </div>
      `;
      
      this.chatMessages.appendChild(typingIndicator);
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    // Hide typing indicator
    hideTypingIndicator() {
      const typingIndicator = document.getElementById('typing-indicator');
      if (typingIndicator) {
        typingIndicator.remove();
      }
    }
    
    // Send message to Ollama
    async sendMessage() {
      const message = this.chatInput.value.trim();
      if (!message) return;
      
      // Debug log
      console.log('Sending message with document ID:', this.activeDocumentId);
      
      // Check connection first
      if (!this.connectionManager.isConnected) {
        try {
          const isConnected = await this.connectionManager.checkOllamaConnection();
          if (!isConnected) {
            alert('Cannot send message: Ollama is not connected. Please ensure Ollama is running.');
            return;
          }
        } catch (error) {
          console.error('Error checking connection:', error);
          alert('Error connecting to Ollama. Please refresh the page and try again.');
          return;
        }
      }
      
      // Add user message to chat
      this.addMessage(message, true);
      
      // Clear input
      this.chatInput.value = '';
      
      // Disable send button
      if (this.sendBtn) {
        this.sendBtn.disabled = true;
        this.sendBtn.style.opacity = '0.6';
        this.sendBtn.style.cursor = 'not-allowed';
      }
      
      try {
        // Show typing indicator
        this.showTypingIndicator();
        
        // Check if the active document might have been deleted
        if (this.activeDocumentId) {
          // If we have any record of this document being deleted
          if (userData.deletedDocumentIds && userData.deletedDocumentIds.includes(this.activeDocumentId)) {
            console.warn('Active document was deleted, clearing reference');
            this.activeDocumentId = null;
            userData.activeDocumentId = null;
            
            // Remove document notification if present
            const notification = document.querySelector('.document-notification');
            if (notification) {
              notification.remove();
            }
            
            // Add a warning message to the chat
            this.addMessage('Note: The previously active document is no longer available. This response will not include document context.');
          }
        }
        
        // Get model and temperature from settings if available
        const model = userData.settings?.model || 'llama3';
        const temperature = userData.settings?.temperature || 0.7;
        
        // Send to main process to handle API call
        const response = await window.electronAPI.sendMessage({
          message,
          conversationId: this.currentConversationId,
          userType: userData.userType || 'individual',
          userId: userData.email || 'default-user',
          activeDocumentId: this.activeDocumentId, // Include active document ID
          model,
          temperature
        });
        
        // Remove typing indicator
        this.hideTypingIndicator();
        
        // Add response to chat
        this.addMessage(response);
      } catch (error) {
        console.error('Error:', error);
        this.hideTypingIndicator();
        this.addMessage('Error: Unable to get a response. Please check if Ollama is running.');
      } finally {
        // Re-enable send button if there's text in the input
        if (this.sendBtn && this.chatInput.value.trim()) {
          this.sendBtn.disabled = false;
          this.sendBtn.style.opacity = '1';
          this.sendBtn.style.cursor = 'pointer';
        }
      }
    }
    
    // Reset conversation when changing subjects or starting new chat
    async resetConversation(newId = 'default') {
      this.currentConversationId = newId;
      await window.electronAPI.resetConversation(this.currentConversationId);
    }
  }
  
  // Initialize message handler
  const messageHandler = new MessageHandler(connectionManager);
  messageHandler.init();
  
  // Function to render messages
  function renderMessages() {
    const chatMessages = document.getElementById('chat-messages');
    
    
    chatMessages.innerHTML = '';
    
    // Add all messages
    messages.forEach(message => {
      const formattedTime = formatTimestamp(message.timestamp);
      
      const messageHtml = `
        <div class="message ${message.sender === 'user' ? 'message-user' : 'message-ai'}" style="align-self: ${message.sender === 'user' ? 'flex-end' : 'flex-start'};">
          <div style="background-color: ${message.sender === 'user' ? '#F47834' : '#E0E0E0'}; color: ${message.sender === 'user' ? 'white' : '#333'}; padding: 12px 16px; border-radius: ${message.sender === 'user' ? '18px 18px 0 18px' : '18px 18px 18px 0'}; max-width: 80%; margin-left: ${message.sender === 'user' ? 'auto' : '0'};">
            ${message.content}
          </div>
          <span style="font-size: 12px; color: #999; margin-top: 5px; align-self: ${message.sender === 'user' ? 'flex-end' : 'flex-start'}; padding: 0 5px; ${message.sender === 'user' ? 'text-align: right; display: block;' : ''}">
            ${formattedTime}
          </span>
        </div>
      `;
      
      chatMessages.innerHTML += messageHtml;
    });
    
    // Show active document notification if applicable
    if (userData.activeDocumentId) {
      setTimeout(() => {
        if (messageHandler && messageHandler.showActiveDocumentNotification) {
          messageHandler.showActiveDocumentNotification();
        }
      }, 100);
    }
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Format timestamp
  function formatTimestamp(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}