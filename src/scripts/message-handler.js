
const { ipcRenderer } = require('electron');

class MessageHandler {
  constructor(connectionManager) {
    this.connectionManager = connectionManager;
    this.chatMessages = document.getElementById('chat-messages');
    this.chatInput = document.getElementById('chat-input');
    this.sendBtn = document.getElementById('send-btn');
    this.currentConversationId = 'default';
  }
  
  init() {
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    if (this.sendBtn) {
      this.sendBtn.addEventListener('click', () => {
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
    
    
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }
  
  
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
    
    // Check connection first
    if (!this.connectionManager.isConnected) {
      await this.connectionManager.checkOllamaConnection();
      if (!this.connectionManager.isConnected) {
        alert('Cannot send message: Ollama is not connected. Please ensure Ollama is running.');
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
      
      this.showTypingIndicator();
      
      
      const response = await ipcRenderer.invoke('send-message', {
        message,
        conversationId: this.currentConversationId,
        userType: window.userData?.userType || 'individual'
      });
      
   
      this.hideTypingIndicator();
      
      
      this.addMessage(response);
    } catch (error) {
      console.error('Error:', error);
      this.hideTypingIndicator();
      this.addMessage('Error: Unable to get a response. Please check if Ollama is running.');
    } finally {
      
      if (this.sendBtn) {
        this.sendBtn.disabled = false;
        this.sendBtn.style.opacity = '1';
        this.sendBtn.style.cursor = 'pointer';
      }
    }
  }
  
  
  async resetConversation(newId = 'default') {
    this.currentConversationId = newId;
    await ipcRenderer.invoke('reset-conversation', this.currentConversationId);
    
  }
}

module.exports = MessageHandler;