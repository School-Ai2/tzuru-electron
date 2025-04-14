const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'src/assets/images/logo.png')
  });

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"]
      }
    });
  });

  // In production, load the built app
  // In development, we'll load the index.html directly
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


ipcMain.handle('get-user-data', async () => {
  // This would eventually connect to a real authentication system
  return { success: true };
});

// IPC handlers for communication with Ollama
ipcMain.handle('check-ollama-connection', async () => {
  try {
    const response = await axios.get('http://localhost:11434/api/tags');
    return response.status === 200;
  } catch (error) {
    console.error('Error checking Ollama connection:', error);
    return false;
  }
});

// Store documents in memory (in a real app, you'd use a database)
global.documents = {};

// Handle document upload
ipcMain.handle('upload-document', async (event, fileData) => {
  try {
    const { fileName, fileContent, fileType, userId } = fileData;
    
    const documentId = `doc_${Date.now()}`;
    
    if (!global.documents[userId]) {
      global.documents[userId] = [];
    }
    
    global.documents[userId].push({
      id: documentId,
      name: fileName,
      type: fileType,
      content: fileContent,
      uploadDate: new Date().toISOString()
    });
    
    return {
      success: true,
      documentId,
      message: `Document "${fileName}" uploaded successfully`
    };
  } catch (error) {
    console.error('Error uploading document:', error);
    return {
      success: false,
      message: 'Failed to upload document: ' + error.message
    };
  }
});

// Get all documents for a user
ipcMain.handle('get-documents', async (event, userId) => {
  try {
    return {
      success: true,
      documents: global.documents[userId] || []
    };
  } catch (error) {
    console.error('Error retrieving documents:', error);
    return {
      success: false,
      message: 'Failed to retrieve documents: ' + error.message
    };
  }
});

// Delete a document
ipcMain.handle('delete-document', async (event, { userId, documentId }) => {
  try {
    if (!global.documents[userId]) {
      return {
        success: false,
        message: 'No documents found for this user'
      };
    }
    
    const initialLength = global.documents[userId].length;
    global.documents[userId] = global.documents[userId].filter(doc => doc.id !== documentId);
    
    if (global.documents[userId].length === initialLength) {
      return {
        success: false,
        message: 'Document not found'
      };
    }
    
    return {
      success: true,
      message: 'Document deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting document:', error);
    return {
      success: false,
      message: 'Failed to delete document: ' + error.message
    };
  }
});

ipcMain.handle('send-message', async (event, args) => {
  const { message, conversationId, userType, userId, activeDocumentId, model, temperature } = args;
  
  try {
    // Format prompt based on user type
    let systemPrompt;
    if (userType === 'student') {
      systemPrompt = "You are Tzuru, an AI learning assistant for students. Your goal is to help students understand concepts but not do their work for them. Encourage critical thinking and provide explanations that lead to understanding. Be friendly, encouraging, and patient.";
    } else if (userType === 'teacher') {
      systemPrompt = "You are Tzuru, an AI learning assistant for teachers. Your goal is to help create educational materials, suggest teaching strategies, and provide resources. Remember that teachers stay in control—you're just a supportive tool.";
    } else {
      systemPrompt = "You are Tzuru, a personalized AI learning assistant. Your goal is to help with learning and understanding complex topics. Be conversational, helpful, and adapt to the user's needs and preferences.";
    }
    
    if (activeDocumentId && global.documents[userId]) {
      const document = global.documents[userId].find(doc => doc.id === activeDocumentId);
      if (document) {
        systemPrompt += `\n\nThe user has provided a document titled "${document.name}". Here is the content of the document:\n\n${document.content}\n\nPlease use this document to inform your responses when relevant.`;
      }
    }
    
    // Store conversation context
    if (!global.conversations) {
      global.conversations = {};
    }
    
    if (!global.conversations[conversationId]) {
      global.conversations[conversationId] = {
        messages: [
          { role: "system", content: systemPrompt }
        ]
      };
    }
    
    global.conversations[conversationId].messages.push(
      { role: "user", content: message }
    );
    
    // Send to Ollama
    const modelToUse = model || 'llama3.2';
    const tempToUse = temperature || 0.7;
    
    const response = await axios.post('http://localhost:11434/api/chat', {
      model: modelToUse,
      messages: global.conversations[conversationId].messages,
      temperature: tempToUse,
      stream: false
    });
    
    if (response.status !== 200) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }
    
    const aiResponse = response.data.message.content;
    
    // Add the AI response to the conversation history
    global.conversations[conversationId].messages.push(
      { role: "assistant", content: aiResponse }
    );
    
    return aiResponse;
  } catch (error) {
    console.error('Error sending message to Ollama:', error);
    return "I'm sorry, I encountered an error while processing your request. Please ensure Ollama is running with a compatible model.";
  }
});

ipcMain.handle('reset-conversation', async (event, conversationId) => {
  // Reset the conversation
  if (global.conversations && global.conversations[conversationId]) {
    const systemMessage = global.conversations[conversationId].messages.find(m => m.role === "system");
    global.conversations[conversationId].messages = systemMessage ? [systemMessage] : [];
  }
  return true;
});