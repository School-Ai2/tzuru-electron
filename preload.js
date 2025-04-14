const { contextBridge, ipcRenderer } = require('electron');


contextBridge.exposeInMainWorld(
  'electronAPI', {
    // Authentication functions
    login: (credentials) => ipcRenderer.invoke('login', credentials),
    getUserData: () => ipcRenderer.invoke('get-user-data'),
    
    // Chat functions
    sendMessage: (args) => ipcRenderer.invoke('send-message', args),
    checkOllamaConnection: () => ipcRenderer.invoke('check-ollama-connection'),
    resetConversation: (conversationId) => ipcRenderer.invoke('reset-conversation', conversationId),
    
    // Document functions
    uploadDocument: (fileData) => ipcRenderer.invoke('upload-document', fileData),
    getDocuments: (userId) => ipcRenderer.invoke('get-documents', userId),
    deleteDocument: (data) => ipcRenderer.invoke('delete-document', data)
  }
);