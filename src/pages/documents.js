function renderDocumentsPage(container) {
    
    let documents = [];
    let activeDocumentId = null;
    
    
    container.innerHTML = `
      <div class="chat-container">
        <div class="chat-sidebar">
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
            
            <div style="padding: 10px 20px; background-color: rgba(244, 120, 52, 0.2); border-left: 3px solid #F47834;">
              <span style="color: #4A2707; font-weight: bold;">My Documents</span>
            </div>
            
            <div style="padding: 10px 20px; margin-top: 10px; cursor: pointer;" id="settings-nav">
              <span style="color: #4A2707;">Settings</span>
            </div>
          </div>
          
          <div class="status-container" style="position: absolute; bottom: 90px; left: 20px; width: calc(100% - 40px); display: flex; align-items: center; pointer-events: none;">
            <div class="status-indicator" style="width: 10px; height: 10px; border-radius: 50%; background-color: #dc3545; margin-right: 10px;"></div>
            <span class="status-text" style="font-size: 12px; color: #4A2707;">Checking Ollama connection...</span>
          </div>
          
          <div style="position: absolute; bottom: 20px; left: 20px; width: calc(100% - 40px);">
            <div style="padding: 15px; background-color: rgba(244, 120, 52, 0.2); border-radius: 8px; display: flex; align-items: center;">
              <div style="width: 36px; height: 36px; border-radius: 50%; background-color: #F47834; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                <span style="color: white;">${userData.email ? userData.email.charAt(0).toUpperCase() : 'U'}</span>
              </div>
              <div>
                <p style="color: #4A2707; font-size: 14px;">${userData.email || 'User'}</p>
                <p style="color: #4A2707; font-size: 12px;">
                  ${userData.userType ? userData.userType.charAt(0).toUpperCase() + userData.userType.slice(1) : 'User'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="chat-main" style="background-color: #FFF; padding: 20px;">
          <h2 style="color: #4A2707; margin-bottom: 20px;">My Documents</h2>
        
        <div style="display: flex; margin-bottom: 20px;">
          <div style="flex: 1;">
            <p style="color: #666; margin-bottom: 10px;">Upload documents to enhance your learning experience. Tzuru will use these documents to provide more relevant and personalized responses.</p>
          </div>
          <div>
            <button id="upload-btn" class="btn" style="margin-left: 20px;">Upload Document</button>
            <input type="file" id="file-input" style="display: none;" accept=".txt,.pdf,.docx,.md"/>
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
    
    // Read file content
    const reader = new FileReader();
    reader.onload = async (e) => {
      const fileContent = e.target.result;
      
      try {
        // Upload document to main process
        const result = await window.electronAPI.uploadDocument({
          fileName: file.name,
          fileContent: fileContent,
          fileType: file.type || 'text/plain',
          userId: userData.email || 'default-user'
        });
        
        if (result.success) {
          
          loadDocuments();
          alert('Document uploaded successfully!');
        } else {
          alert('Failed to upload document: ' + result.message);
        }
      } catch (error) {
        console.error('Error uploading document:', error);
        alert('An error occurred while uploading the document.');
      }
    };
    
    reader.readAsText(file);
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
      const result = await window.electronAPI.getDocuments(userData.email || 'default-user');
      
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
      docElement.style.padding = '10px';
      docElement.style.marginBottom = '10px';
      docElement.style.backgroundColor = '#F7F1EA';
      docElement.style.borderRadius = '8px';
      
      // Document info
      const docInfo = document.createElement('div');
      
      const docName = document.createElement('p');
      docName.style.fontWeight = 'bold';
      docName.style.color = '#4A2707';
      docName.textContent = doc.name;
      
      const docDate = document.createElement('p');
      docDate.style.fontSize = '12px';
      docDate.style.color = '#666';
      docDate.textContent = 'Uploaded: ' + new Date(doc.uploadDate).toLocaleString();
      
      docInfo.appendChild(docName);
      docInfo.appendChild(docDate);
      
      // Action buttons
      const docActions = document.createElement('div');
      
      const useBtn = document.createElement('button');
      useBtn.className = 'btn';
      useBtn.style.marginRight = '10px';
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
        if (confirm(`Are you sure you want to delete "${doc.name}"?`)) {
          try {
            const result = await window.electronAPI.deleteDocument({
              userId: userData.email || 'default-user',
              documentId: doc.id
            });
            
            if (result.success) {
              // Clear all document references completely
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
  
  document.getElementById('settings-nav').addEventListener('click', () => {
    navigateToPage('settings');
  });
  
  // Load documents on page load
  loadDocuments();
}