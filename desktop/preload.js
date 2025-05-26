const { contextBridge, ipcRenderer } = require('electron');

// Expose class API methods
contextBridge.exposeInMainWorld(
  'classAPI', {
    createClass: (classData) => ipcRenderer.invoke('create-class', classData),
    getMyClasses: () => ipcRenderer.invoke('get-my-classes'),
    joinClass: (classCode) => ipcRenderer.invoke('join-class', classCode),
      getClassDetails: (classId) => ipcRenderer.invoke('get-class-details', classId),
      uploadClassDocument: (classId, documentData) => ipcRenderer.invoke('upload-class-document', classId, documentData),
      getClassDocuments: (classId) => ipcRenderer.invoke('get-class-documents', classId),
      deleteClassDocument: (documentId) => ipcRenderer.invoke('delete-class-document', documentId),
      removeStudentFromClass: (classId, studentId) => ipcRenderer.invoke('remove-student', classId, studentId)
    }
  );
  
  contextBridge.exposeInMainWorld(
    'electronAPI', {
      // Authentication functions
      login: (credentials) => ipcRenderer.invoke('login', credentials),
      getUserData: () => ipcRenderer.invoke('get-user-data'),
      logout: () => ipcRenderer.invoke('logout'),
      
      // Chat functions
      sendMessage: (args) => ipcRenderer.invoke('send-message', args),
      checkOllamaConnection: () => ipcRenderer.invoke('check-ollama-connection'),
      resetConversation: (conversationId) => ipcRenderer.invoke('reset-conversation', conversationId),
      
      // Document functions
      uploadDocument: (fileData) => ipcRenderer.invoke('upload-document', fileData),
      getDocuments: (userId) => ipcRenderer.invoke('get-documents', userId),
      deleteDocument: (data) => ipcRenderer.invoke('delete-document', data),
      documentExists: (data) => ipcRenderer.invoke('documentExists', data),
      
      // Token management
      setAuthToken: (token) => ipcRenderer.invoke('set-auth-token', token)
    }
  );
  
  // Expose API methods for authentication through IPC
  contextBridge.exposeInMainWorld(
    'authAPI', {
      register: (userData) => ipcRenderer.invoke('auth-register', userData),
      login: (credentials) => ipcRenderer.invoke('auth-login', credentials),
      getProfile: () => ipcRenderer.invoke('auth-get-profile'),
      updateSettings: (settings) => ipcRenderer.invoke('auth-update-settings', settings),
      updateUserType: (userType) => ipcRenderer.invoke('auth-update-usertype', userType)
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