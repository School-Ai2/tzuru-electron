function renderSettingsPage(container) {
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
            
            <div style="padding: 10px 20px; margin-top: 10px; cursor: pointer;" id="documents-nav">
              <span style="color: #4A2707;">My Documents</span>
            </div>
            
            <div style="padding: 10px 20px; background-color: rgba(244, 120, 52, 0.2); border-left: 3px solid #F47834;">
              <span style="color: #4A2707; font-weight: bold;">Settings</span>
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
          <h2 style="color: #4A2707; margin-bottom: 20px;">Settings</h2>
          
          <div style="border-bottom: 1px solid #E0E0E0; padding-bottom: 20px; margin-bottom: 20px;">
            <h3 style="color: #4A2707; margin-bottom: 15px;">AI Model Settings</h3>
            
            <div style="margin-bottom: 15px;">
              <label for="model-selector" style="display: block; margin-bottom: 5px; color: #4A2707;">Model</label>
              <select id="model-selector" class="form-control" style="width: 300px;">
                <option value="llama3.2">Llama 3 (Default)</option>
                <option value="llama3.2:8b">Llama 3 (8B)</option>
                <option value="mistral">Mistral</option>
                <option value="phi3">Phi-3</option>
              </select>
            </div>
            
            <div style="margin-bottom: 15px;">
              <label for="temperature-slider" style="display: block; margin-bottom: 5px; color: #4A2707;">Temperature: <span id="temperature-value">0.7</span></label>
              <input type="range" id="temperature-slider" min="0" max="1" step="0.1" value="0.7" style="width: 300px;">
              <div style="display: flex; justify-content: space-between; width: 300px; font-size: 12px; color: #666;">
                <span>More Focused</span>
                <span>More Creative</span>
              </div>
            </div>
          </div>
          
          <div style="margin-top: 20px;">
            <button id="save-settings-btn" class="btn">Save Settings</button>
            <button id="reset-settings-btn" class="btn btn-secondary" style="margin-left: 10px;">Reset to Defaults</button>
          </div>
        </div>
      </div>
    `;
    
    // Initialize connection manager
    const connectionManager = new window.ConnectionManager();
    connectionManager.init();
    
    // Get elements
    const modelSelector = document.getElementById('model-selector');
    const temperatureSlider = document.getElementById('temperature-slider');
    const temperatureValue = document.getElementById('temperature-value');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const resetSettingsBtn = document.getElementById('reset-settings-btn');
    
    // Load current settings if available
    if (userData.settings) {
      modelSelector.value = userData.settings.model || 'llama3.2';
      temperatureSlider.value = userData.settings.temperature || 0.7;
      temperatureValue.textContent = temperatureSlider.value;
    }
    
    // Add event listeners
    temperatureSlider.addEventListener('input', () => {
      temperatureValue.textContent = temperatureSlider.value;
    });
    
    saveSettingsBtn.addEventListener('click', () => {
      // Save settings to userData
      userData.settings = {
        model: modelSelector.value,
        temperature: parseFloat(temperatureSlider.value)
      };
      
      alert('Settings saved successfully!');
    });
    
    resetSettingsBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all settings to defaults?')) {
        modelSelector.value = 'llama3.2';
        temperatureSlider.value = 0.7;
        temperatureValue.textContent = '0.7';
        
        userData.settings = {
          model: 'llama3.2',
          temperature: 0.7
        };
        
        alert('Settings reset to defaults.');
      }
    });
    
    // Add navigation handlers
    document.getElementById('chat-nav').addEventListener('click', () => {
      navigateToPage('chat');
    });
    
    document.getElementById('documents-nav').addEventListener('click', () => {
      navigateToPage('documents');
    });
  }