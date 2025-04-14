// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electronAPI', {
    // Authentication functions
    login: (credentials) => ipcRenderer.invoke('login', credentials),
    getUserData: () => ipcRenderer.invoke('get-user-data'),
    
    // Chat functions
    sendMessage: (args) => ipcRenderer.invoke('send-message', args),
    checkOllamaConnection: () => ipcRenderer.invoke('check-ollama-connection'),
    resetConversation: (conversationId) => ipcRenderer.invoke('reset-conversation', conversationId)
  }
);