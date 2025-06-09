const { contextBridge, ipcRenderer } = require('electron');

// Expose simplified API methods (no authentication, classes, etc.)
contextBridge.exposeInMainWorld(
  'electronAPI', {
    // Chat functions
    sendMessage: (args) => ipcRenderer.invoke('send-message', args),
    checkOllamaConnection: () => ipcRenderer.invoke('check-ollama-connection'),
    resetConversation: (conversationId) => ipcRenderer.invoke('reset-conversation', conversationId),
    
    // Document functions
    uploadDocument: (fileData) => ipcRenderer.invoke('upload-document', fileData),
    getDocuments: (userId) => ipcRenderer.invoke('get-documents', userId),
    deleteDocument: (data) => ipcRenderer.invoke('delete-document', data),
    documentExists: (data) => ipcRenderer.invoke('documentExists', data)
  }
);

// Expose localStorage for basic state management
contextBridge.exposeInMainWorld(
  'localStorage', {
    getItem: (key) => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value),
    removeItem: (key) => localStorage.removeItem(key)
  }
);