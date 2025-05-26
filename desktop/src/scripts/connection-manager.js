
class ConnectionManager {
    constructor() {
      this.statusIndicator = document.querySelector('.status-indicator');
      this.statusText = document.querySelector('.status-text');
      this.isConnected = false;
    }
    
    init() {
      
      this.checkOllamaConnection();
      
      
      setInterval(() => this.checkOllamaConnection(), 30000); // Check every 30 seconds
    }
    
    // Check connection to Ollama
    async checkOllamaConnection() {
      try {
        const isConnected = await window.electronAPI.checkOllamaConnection();
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
  
  // Make it globally available
  window.ConnectionManager = ConnectionManager;