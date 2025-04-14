// src/scripts/connection.js
const { ipcRenderer } = require('electron');

class ConnectionManager {
  constructor() {
    this.statusIndicator = document.querySelector('.status-indicator');
    this.statusText = document.querySelector('.status-text');
    this.isConnected = false;
  }
  
  init() {
    // Add status indicator to the UI if it doesn't exist
    this.ensureStatusIndicatorExists();
    
    // Initial connection check
    this.checkOllamaConnection();
    
    // Set up periodic connection checks
    setInterval(() => this.checkOllamaConnection(), 30000); // Check every 30 seconds
  }
  
  ensureStatusIndicatorExists() {
    if (!this.statusIndicator) {
      // Create status indicator if it doesn't exist
      const sidebar = document.querySelector('.chat-sidebar');
      if (sidebar) {
        const statusContainer = document.createElement('div');
        statusContainer.style.position = 'absolute';
        statusContainer.style.bottom = '80px';
        statusContainer.style.left = '20px';
        statusContainer.style.right = '20px';
        statusContainer.style.display = 'flex';
        statusContainer.style.alignItems = 'center';
        
        this.statusIndicator = document.createElement('div');
        this.statusIndicator.className = 'status-indicator disconnected';
        this.statusIndicator.style.width = '10px';
        this.statusIndicator.style.height = '10px';
        this.statusIndicator.style.borderRadius = '50%';
        this.statusIndicator.style.marginRight = '10px';
        
        this.statusText = document.createElement('span');
        this.statusText.className = 'status-text';
        this.statusText.style.fontSize = '12px';
        this.statusText.style.color = '#4A2707';
        this.statusText.textContent = 'Checking Ollama connection...';
        
        statusContainer.appendChild(this.statusIndicator);
        statusContainer.appendChild(this.statusText);
        sidebar.appendChild(statusContainer);
      }
    }
  }
  
  // Check connection to Ollama
  async checkOllamaConnection() {
    try {
      const isConnected = await ipcRenderer.invoke('check-ollama-connection');
      this.updateConnectionUI(isConnected);
      this.isConnected = isConnected;
      return isConnected;
    } catch (error) {
      console.error('Error checking Ollama connection:', error);
      this.updateConnectionUI(false);
      this.isConnected = false;
      return false;
    }
  }
  
  // Update the connection status UI
  updateConnectionUI(connected) {
    if (!this.statusIndicator || !this.statusText) return;
    
    if (connected) {
      this.statusIndicator.style.backgroundColor = '#28a745'; // Green
      this.statusText.textContent = 'Connected to Ollama';
    } else {
      this.statusIndicator.style.backgroundColor = '#dc3545'; // Red
      this.statusText.textContent = 'Disconnected from Ollama';
    }
  }
}

module.exports = ConnectionManager;