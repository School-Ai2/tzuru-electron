function renderSettingsPage(container) {
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
          
          <div style="padding: 10px 20px; margin-top: 10px; cursor: pointer;" id="documents-nav">
            <span style="color: #4A2707;">My Documents</span>
          </div>
          
          <div style="padding: 10px 20px; background-color: rgba(244, 120, 52, 0.2); border-left: 3px solid #F47834;">
            <span style="color: #4A2707; font-weight: bold;">Settings</span>
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
        <h2 style="color: #4A2707; margin-bottom: 20px;">Settings</h2>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 10px; color: #4A2707;">AI Model</label>
          <select id="model-selector" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <option value="llama3.2">Llama 3.2</option>
            <option value="llama2">Llama 2</option>
          </select>
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 10px; color: #4A2707;">Temperature</label>
          <input type="range" id="temperature-slider" min="0" max="1" step="0.1" value="0.7" style="width: 100%;">
          <div style="display: flex; justify-content: space-between; margin-top: 5px;">
            <span style="color: #666; font-size: 12px;">More Focused</span>
            <span id="temperature-value" style="color: #4A2707;">0.7</span>
            <span style="color: #666; font-size: 12px;">More Creative</span>
          </div>
        </div>
        
        <div style="display: flex; gap: 10px; margin-top: 30px;">
          <button id="save-settings" class="btn">Save Settings</button>
          <button id="reset-settings" class="btn btn-secondary">Reset to Defaults</button>
        </div>
        
        <div id="settings-status" style="margin-top: 15px; padding: 10px; border-radius: 4px; display: none;"></div>
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
  const saveSettingsBtn = document.getElementById('save-settings');
  const resetSettingsBtn = document.getElementById('reset-settings');
  const settingsStatus = document.getElementById('settings-status');
  
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
  
  // Function to show status message
  function showStatus(message, isSuccess = true) {
    settingsStatus.textContent = message;
    settingsStatus.style.display = 'block';
    settingsStatus.style.backgroundColor = isSuccess ? 'rgba(40, 167, 69, 0.2)' : 'rgba(220, 53, 69, 0.2)';
    settingsStatus.style.color = isSuccess ? '#28a745' : '#dc3545';
    
    // Hide after 3 seconds
    setTimeout(() => {
      settingsStatus.style.display = 'none';
    }, 3000);
  }
  
  saveSettingsBtn.addEventListener('click', async () => {
    try {
      // Save settings to userData
      const newSettings = {
        model: modelSelector.value,
        temperature: parseFloat(temperatureSlider.value)
      };
      
      userData.settings = newSettings;
      
      // Save to localStorage for persistence
      window.localStorage.setItem('tzuru_settings', JSON.stringify(newSettings));
      
      showStatus('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      showStatus('Failed to save settings.', false);
    }
  });
  
  resetSettingsBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      const defaultSettings = {
        model: 'llama3.2',
        temperature: 0.7
      };
      
      // Update UI
      modelSelector.value = defaultSettings.model;
      temperatureSlider.value = defaultSettings.temperature;
      temperatureValue.textContent = defaultSettings.temperature;
      
      try {
        // Update userData
        userData.settings = defaultSettings;
        
        // Save to localStorage
        window.localStorage.setItem('tzuru_settings', JSON.stringify(defaultSettings));
        
        showStatus('Settings reset to defaults.');
      } catch (error) {
        console.error('Error resetting settings:', error);
        showStatus('Failed to reset settings.', false);
      }
    }
  });
  
  // Add navigation handlers
  document.getElementById('chat-nav').addEventListener('click', () => {
    navigateToPage('chat');
  });
  
  document.getElementById('classes-nav').addEventListener('click', () => {
    navigateToPage('classes');
  });
  
  document.getElementById('documents-nav').addEventListener('click', () => {
    navigateToPage('documents');
  });
}