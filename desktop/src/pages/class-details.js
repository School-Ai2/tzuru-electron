function renderClassDetailsPage(container) {
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
            
            <div style="padding: 10px 20px; margin-top: 10px; cursor: pointer;" id="classes-nav">
              <span style="color: #4A2707;">My Classes</span>
            </div>
            
            <div style="padding: 10px 20px; margin-top: 10px; cursor: pointer;" id="settings-nav">
              <span style="color: #4A2707;">Settings</span>
            </div>
          </div>
          
          <div style="position: absolute; bottom: 90px; left: 20px; width: calc(100% - 40px);">
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
          
          <div class="status-container" style="position: absolute; bottom: 20px; left: 20px; width: calc(100% - 40px); display: flex; align-items: center; pointer-events: none;">
            <div class="status-indicator" style="width: 10px; height: 10px; border-radius: 50%; background-color: #dc3545; margin-right: 10px;"></div>
            <span class="status-text" style="font-size: 12px; color: #4A2707;">Checking connection...</span>
          </div>
        </div>
        
        <div class="chat-main" style="background-color: #FFF; padding: 20px;">
          <h2 style="color: #4A2707;">Class Details</h2>
          <p>Class details page coming soon...</p>
        </div>
      </div>
    `;
    
    // Navigation handlers
    document.getElementById('chat-nav').addEventListener('click', () => {
      navigateToPage('chat');
    });
    
    document.getElementById('classes-nav').addEventListener('click', () => {
      navigateToPage('classes');
    });
    
    document.getElementById('settings-nav').addEventListener('click', () => {
      navigateToPage('settings');
    });
  }