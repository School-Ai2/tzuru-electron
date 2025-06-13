function renderDocumentsPage(container) {
  let documents = [];
  let activeDocumentId = null;
  
  container.innerHTML = `
    <div class="chat-container">
      <div class="chat-sidebar" style="width: 280px; position: relative; min-height: 100vh; background: #FFE5CC;">
        <div style="text-align: center; padding: 15px 0;">
          <img src="./src/assets/images/logo.png" alt="Tzuru Logo" style="width: 40px; height: 40px;">
          <h2 style="color: #4A2707; margin-top: 10px;">Tzuru</h2>
          <p style="color: #4A2707; font-size: 14px; margin-top: 5px;">
            Your AI Learning Assistant
          </p>
        </div>
        
        <div style="margin-top: 30px;">
          <div style="padding: 10px 20px; margin-top: 10px; cursor: pointer;" id="chat-nav">
            <span style="color: #4A2707;">Chat</span>
          </div>
          
          <div style="padding: 10px 20px; margin-top: 10px; cursor: pointer;" id="classes-nav">
            <span style="color: #4A2707;">My Classes</span>
          </div>
          
          <div style="padding: 10px 20px; background-color: rgba(244, 120, 52, 0.2); border-left: 3px solid #F47834;">
            <span style="color: #4A2707; font-weight: bold;">My Documents</span>
          </div>
          
          <div style="padding: 10px 20px; margin-top: 10px; cursor: pointer;" id="settings-nav">
            <span style="color: #4A2707;">Settings</span>
          </div>
        </div>
        
        <div style="position: absolute; left: 0; right: 0; bottom: 20px; padding: 0 20px;">
          <div style="padding: 15px; background-color: rgba(244, 120, 52, 0.2); border-radius: 8px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center;">
                <div style="width: 36px; height: 36px; border-radius: 50%; background-color: #F47834; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                  <span style="color: white;">${userData.email ? userData.email.charAt(0).toUpperCase() : 'U'}</span>
                </div>
                <div>
                  <p style="color: #4A2707; font-size: 14px; margin: 0;">${userData.email || 'User'}</p>
                  <p style="color: #4A2707; font-size: 12px; margin: 0;">
                    ${userData.userType ? userData.userType.charAt(0).toUpperCase() + userData.userType.slice(1) : 'User'}
                  </p>
                </div>
              </div>
              <button 
                onclick="window.logout()" 
                style="padding: 6px 16px; background-color: transparent; color: #F47834; border: 1px solid #F47834; border-radius: 4px; cursor: pointer; font-size: 12px; transition: all 0.2s;"
                onmouseover="this.style.backgroundColor='#F47834'; this.style.color='white';"
                onmouseout="this.style.backgroundColor='transparent'; this.style.color='#F47834';"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="chat-main" style="background-color: #FFF; padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2 style="color: #4A2707; margin: 0;">My Documents</h2>
          <button id="upload-document-btn" class="btn">Upload Document</button>
        </div>
        
        <div style="display: flex; margin-bottom: 20px;">
          <div style="flex: 1;">
            <p style="color: #666; margin-bottom: 10px;">Upload PDF documents to enhance your learning experience. Tzuru will analyze the chapters and use them to provide more relevant and personalized responses.</p>
          </div>
          <div>
            <button id="upload-btn" class="btn" style="margin-left: 20px;">Upload PDF Document</button>
            <input type="file" id="file-input" style="display: none;" accept=".pdf"/>
          </div>
        </div>
        
        <div style="border-top: 1px solid #E0E0E0; padding-top: 20px;">
          <h3 style="color: #4A2707; margin-bottom: 15px;">My Uploaded Documents</h3>
          
          <div id="documents-list" style="margin-top: 15px;">
            <p id="no-documents-message" style="color: #666; font-style: italic;">No documents uploaded yet.</p>
          </div>
        </div>
      </div>
    </div>
  `;

  const uploadBtn = document.getElementById('upload-btn');
  const fileInput = document.getElementById('file-input');
  const documentsList = document.getElementById('documents-list');
  const noDocumentsMessage = document.getElementById('no-documents-message');

  // Initialize connection manager for Ollama status
  const connectionManager = new window.ConnectionManager();
  connectionManager.init();

  uploadBtn.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', async (event) => {
    if (!event.target.files.length) return;
    
    const file = event.target.files[0];
    
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please select a PDF file.');
      return;
    }
    
    // Show upload progress
    uploadBtn.textContent = 'Uploading...';
    uploadBtn.disabled = true;
    
    try {
      // Read file content as ArrayBuffer
      const fileContent = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          console.log('File read successfully, size:', e.target.result.byteLength);
          resolve(new Uint8Array(e.target.result));
        };
        reader.onerror = (e) => {
          console.error('Error reading file:', e);
          reject(e);
        };
        reader.readAsArrayBuffer(file);
      });
      
      console.log('Sending file to main process:', file.name, fileContent.length, 'bytes');
      
      // Upload document to backend via main process
      const result = await window.electronAPI.uploadDocument({
        fileName: file.name,
        fileContent: Array.from(fileContent), // Convert Uint8Array to regular array
        userId: userData.email
      });
      
      if (result.success) {
        loadDocuments();
        alert(`Document uploaded and processed successfully!\n\nFound ${result.chapters?.length || 0} chapters.`);
      } else {
        alert('Failed to upload document: ' + result.message);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('An error occurred while uploading the document.');
    } finally {
      // Reset upload button
      uploadBtn.textContent = 'Upload PDF Document';
      uploadBtn.disabled = false;
      fileInput.value = ''; // Clear file input
    }
  });

  function navigateToChatWithDocument(documentId) {
    // Verify document exists before setting as active
    const docExists = documents.some(doc => doc.id === documentId);
    
    if (!docExists) {
      alert('The selected document is no longer available.');
      return;
    }
    
    // Store active document ID in userData
    userData.activeDocumentId = documentId;
    console.log('Setting active document ID:', documentId);
    
    // Navigate to chat
    navigateToPage('chat');
  }

  // Function to load documents from main process
  async function loadDocuments() {
    try {
      const result = await window.electronAPI.getDocuments(userData.email);
      
      if (result.success) {
        documents = result.documents;
        
        if (documents.length > 0) {
          noDocumentsMessage.style.display = 'none';
          renderDocumentsList();
        } else {
          noDocumentsMessage.style.display = 'block';
          documentsList.innerHTML = '';
          documentsList.appendChild(noDocumentsMessage);
        }
      } else {
        console.error('Failed to load documents:', result.message);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  }

  // Function to render documents list
  function renderDocumentsList() {
    documentsList.innerHTML = '';
    
    documents.forEach(doc => {
      const docElement = document.createElement('div');
      docElement.className = 'document-item';
      docElement.style.display = 'flex';
      docElement.style.justifyContent = 'space-between';
      docElement.style.alignItems = 'center';
      docElement.style.padding = '15px';
      docElement.style.marginBottom = '10px';
      docElement.style.backgroundColor = '#F7F1EA';
      docElement.style.borderRadius = '8px';
      docElement.style.border = '1px solid #E0E0E0';
      
      // Document info
      const docInfo = document.createElement('div');
      
      const docName = document.createElement('p');
      docName.style.fontWeight = 'bold';
      docName.style.color = '#4A2707';
      docName.style.margin = '0 0 5px 0';
      docName.textContent = doc.name;
      
      const docDate = document.createElement('p');
      docDate.style.fontSize = '12px';
      docDate.style.color = '#666';
      docDate.style.margin = '0 0 5px 0';
      docDate.textContent = 'Uploaded: ' + new Date(doc.uploadDate).toLocaleString();
      
      const chaptersInfo = document.createElement('p');
      chaptersInfo.style.fontSize = '12px';
      chaptersInfo.style.color = '#F47834';
      chaptersInfo.style.margin = '0';
      chaptersInfo.textContent = `📄 ${doc.chapters?.length || 0} chapters processed`;
      
      docInfo.appendChild(docName);
      docInfo.appendChild(docDate);
      docInfo.appendChild(chaptersInfo);
      
      // Action buttons
      const docActions = document.createElement('div');
      docActions.style.display = 'flex';
      docActions.style.gap = '10px';
      
      const useBtn = document.createElement('button');
      useBtn.className = 'btn';
      useBtn.style.padding = '8px 12px';
      useBtn.style.fontSize = '14px';
      useBtn.textContent = 'Use in Chat';
      useBtn.addEventListener('click', () => navigateToChatWithDocument(doc.id));
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn btn-secondary';
      deleteBtn.style.padding = '8px 12px';
      deleteBtn.style.fontSize = '14px';
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', async () => {
        if (confirm(`Are you sure you want to delete "${doc.name}"?\n\nThis will remove all processed chapters and cannot be undone.`)) {
          try {
            const result = await window.electronAPI.deleteDocument({
              userId: userData.email,
              documentId: doc.id
            });
            
            if (result.success) {
              // Clear all document references
              clearDocumentReferences();
              
              // Reload documents list
              loadDocuments();
            } else {
              alert('Failed to delete document: ' + result.message);
            }
          } catch (error) {
            console.error('Error deleting document:', error);
            alert('An error occurred while deleting the document.');
          }
        }
      });
      
      docActions.appendChild(useBtn);
      docActions.appendChild(deleteBtn);
      
      docElement.appendChild(docInfo);
      docElement.appendChild(docActions);
      
      documentsList.appendChild(docElement);
    });
  }

  // Add click handlers for navigation
  document.getElementById('chat-nav').addEventListener('click', () => {
    navigateToPage('chat');
  });

  document.getElementById('classes-nav').addEventListener('click', () => {
    navigateToPage('classes');
  });

  document.getElementById('settings-nav').addEventListener('click', () => {
    navigateToPage('settings');
  });

  // Load documents on page load
  loadDocuments();
}