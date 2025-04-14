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

  // Set custom CSP headers
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

  // Open DevTools in development mode
  // mainWindow.webContents.openDevTools();

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

// IPC handlers for communication between renderer and main processes
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

ipcMain.handle('send-message', async (event, args) => {
  const { message, conversationId, userType } = args;
  
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
    
    // Store conversation context (in a real app, this would be more sophisticated)
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
    
    // Add the user message to the conversation
    global.conversations[conversationId].messages.push(
      { role: "user", content: message }
    );
    
    // Send to Ollama
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2', // Default model, could be configurable
        messages: global.conversations[conversationId].messages,
        stream: false
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    const aiResponse = data.message.content;
    
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
    // Keep only the system message
    const systemMessage = global.conversations[conversationId].messages.find(m => m.role === "system");
    global.conversations[conversationId].messages = systemMessage ? [systemMessage] : [];
  }
  return true;
});