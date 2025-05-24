const { contextBridge, ipcRenderer } = require('electron');
const { auth } = require('./src/utils/api');

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
    deleteDocument: (data) => ipcRenderer.invoke('delete-document', data),
    documentExists: (data) => ipcRenderer.invoke('documentExists', data)
  }
);

// Expose API methods for authentication
contextBridge.exposeInMainWorld(
  'authAPI', {
    register: (userData) => auth.register(userData),
    login: (credentials) => auth.login(credentials),
    getProfile: () => auth.getProfile(),
    updateSettings: (settings) => auth.updateSettings(settings),
    updateUserType: (userType) => auth.updateUserType(userType)
  }
);

// Expose localStorage for token storage
contextBridge.exposeInMainWorld(
  'localStorage', {
    getItem: (key) => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value),
    removeItem: (key) => localStorage.removeItem(key)
  }
);