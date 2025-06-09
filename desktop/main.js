const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

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

// Store documents and conversations in memory
global.documents = {};
global.conversations = {};
global.contextHeaps = {}; // Store chapter context for each document

// Handle document upload to new backend
ipcMain.handle('upload-document', async (event, fileData) => {
  try {
    const { fileName, fileContent, userId } = fileData;
    
    console.log('Received upload request:', fileName, 'Content length:', fileContent?.length);
    
    if (!fileContent || fileContent.length === 0) {
      throw new Error('No file content received');
    }
    
    // Write the file content to a temporary file
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempFilePath = path.join(tempDir, `temp_${Date.now()}_${fileName}`);
    
    // Convert array back to Buffer
    const buffer = Buffer.from(fileContent);
    fs.writeFileSync(tempFilePath, buffer);
    
    console.log('Wrote temp file:', tempFilePath, 'Size:', buffer.length);
    
    // Create form data and upload to backend server
    const form = new FormData();
    form.append('file', fs.createReadStream(tempFilePath));
    
    console.log('Uploading to backend...');
    const uploadResponse = await axios.post('http://localhost:57005/upload', form, {
      headers: form.getHeaders(),
    });
    
    const backendFileName = uploadResponse.data.filename;
    console.log('Backend filename:', backendFileName);
    
    // Clean up temp file
    fs.unlinkSync(tempFilePath);
    
    // Fetch chapters from backend server
    console.log('Fetching chapters...');
    const chaptersResponse = await axios.get(`http://localhost:57005/chapters/${backendFileName}`);
    const chapters = chaptersResponse.data.chapters;
    
    console.log('Received chapters:', chapters.length);
    
    const documentId = `doc_${Date.now()}`;
    
    if (!global.documents[userId]) {
      global.documents[userId] = [];
    }
    
    // Store document info locally for UI
    global.documents[userId].push({
      id: documentId,
      name: fileName,
      backendFileName: backendFileName,
      chapters: chapters,
      uploadDate: new Date().toISOString()
    });
    
    // Build context heap for AI conversations
    const contextHeap = [];
    for (const chapter of chapters) {
      contextHeap.push(`${chapter.title}\n${chapter.content}`);
    }
    global.contextHeaps[documentId] = contextHeap;
    
    return {
      success: true,
      documentId,
      chapters: chapters,
      message: `Document "${fileName}" uploaded and processed successfully`
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
    
    // Remove document references from conversations
    if (global.conversations) {
      for (const conversationId in global.conversations) {
        if (global.conversations[conversationId].activeDocumentId === documentId) {
          global.conversations[conversationId].activeDocumentId = null;
          global.conversations[conversationId].messages = [
            { role: "system", content: "You are Tzuru, an AI learning assistant. Be helpful, encouraging, and patient." }
          ];
        }
      }
    }
    
    // Remove the document and its context heap
    global.documents[userId] = global.documents[userId].filter(doc => doc.id !== documentId);
    delete global.contextHeaps[documentId];
    
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

// Check if document exists
ipcMain.handle('documentExists', async (event, { userId, documentId }) => {
  try {
    if (!global.documents[userId]) {
      return false;
    }
    
    return global.documents[userId].some(doc => doc.id === documentId);
  } catch (error) {
    console.error('Error checking if document exists:', error);
    return false;
  }
});

// Send message with document context
ipcMain.handle('send-message', async (event, args) => {
  const { message, conversationId, userId, activeDocumentId, model, temperature } = args;
  
  try {
    let systemPrompt = "You are Tzuru, an AI learning assistant. Be helpful, encouraging, and patient.";
    
    // Store conversation context
    if (!global.conversations) {
      global.conversations = {};
    }
    
    if (!global.conversations[conversationId]) {
      global.conversations[conversationId] = {
        messages: [{ role: "system", content: systemPrompt }],
        activeDocumentId: null
      };
    }
    
    // Update active document for this conversation
    global.conversations[conversationId].activeDocumentId = activeDocumentId;
    
    // Build context with document chapters if available
    let contextualPrompt = message;
    if (activeDocumentId && global.contextHeaps[activeDocumentId]) {
      const contextHeap = global.contextHeaps[activeDocumentId];
      // Add relevant chapters as context (for now, add all - could be optimized)
      const documentContext = contextHeap.join('\n\n---\n\n');
      contextualPrompt = `Based on the following document content, please answer the question:\n\n${documentContext}\n\nQuestion: ${message}`;
    }
    
    global.conversations[conversationId].messages.push(
      { role: "user", content: contextualPrompt }
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

// Reset conversation
ipcMain.handle('reset-conversation', async (event, conversationId) => {
  if (global.conversations && global.conversations[conversationId]) {
    const systemMessage = global.conversations[conversationId].messages.find(m => m.role === "system");
    global.conversations[conversationId].messages = systemMessage ? [systemMessage] : [];
    global.conversations[conversationId].activeDocumentId = null;
  }
  return true;
});