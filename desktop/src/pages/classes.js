function renderClassesPage(container) {
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
              <span style="color: #4A2707; font-weight: bold;">My Classes</span>
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
          ${userData.userType === 'teacher' ? `
            <!-- Teacher View -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <h2 style="color: #4A2707; margin: 0;">My Classes</h2>
              <button id="create-class-btn" class="btn">Create New Class</button>
            </div>
            
            <div id="classes-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
              <!-- Classes will be rendered here -->
            </div>
          ` : `
            <!-- Student View -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <h2 style="color: #4A2707; margin: 0;">My Classes</h2>
              <button id="join-class-btn" class="btn">Join Class</button>
            </div>
            
            <div id="classes-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
              <!-- Classes will be rendered here -->
            </div>
          `}
        </div>
      </div>
      
      <!-- Create Class Modal (Teacher) -->
      <div id="create-class-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); z-index: 1000;">
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: white; padding: 30px; border-radius: 8px; width: 400px;">
          <h3 style="color: #4A2707; margin-bottom: 20px;">Create New Class</h3>
          <form id="create-class-form">
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; color: #4A2707;">Class Name</label>
              <input type="text" id="class-name" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div style="margin-bottom: 20px;">
              <label style="display: block; margin-bottom: 5px; color: #4A2707;">Description (Optional)</label>
              <textarea id="class-description" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; height: 80px;"></textarea>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
              <button type="button" class="btn btn-secondary" onclick="closeCreateClassModal()">Cancel</button>
              <button type="submit" class="btn">Create Class</button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Join Class Modal (Student) -->
      <div id="join-class-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); z-index: 1000;">
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: white; padding: 30px; border-radius: 8px; width: 400px;">
          <h3 style="color: #4A2707; margin-bottom: 20px;">Join a Class</h3>
          <form id="join-class-form">
            <div style="margin-bottom: 20px;">
              <label style="display: block; margin-bottom: 5px; color: #4A2707;">Class Code</label>
              <input type="text" id="class-code" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; text-transform: uppercase;" placeholder="Enter 6-digit class code">
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
              <button type="button" class="btn btn-secondary" onclick="closeJoinClassModal()">Cancel</button>
              <button type="submit" class="btn">Join Class</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    // Initialize connection manager
    const connectionManager = new window.ConnectionManager();
    connectionManager.init();
    
    let classes = [];
    
    // Navigation handlers
    document.getElementById('chat-nav').addEventListener('click', () => {
      navigateToPage('chat');
    });
    
    document.getElementById('settings-nav').addEventListener('click', () => {
      navigateToPage('settings');
    });
    
    // Modal functions
    window.closeCreateClassModal = () => {
      document.getElementById('create-class-modal').style.display = 'none';
      document.getElementById('create-class-form').reset();
    };
    
    window.closeJoinClassModal = () => {
      document.getElementById('join-class-modal').style.display = 'none';
      document.getElementById('join-class-form').reset();
    };
    
    // Teacher specific handlers
    if (userData.userType === 'teacher') {
      document.getElementById('create-class-btn').addEventListener('click', () => {
        document.getElementById('create-class-modal').style.display = 'block';
      });
      
      document.getElementById('create-class-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const className = document.getElementById('class-name').value;
        const description = document.getElementById('class-description').value;
        
        try {
          await window.classAPI.createClass({ name: className, description });
          closeCreateClassModal();
          loadClasses();
          alert('Class created successfully!');
        } catch (error) {
          alert('Failed to create class: ' + error.message);
        }
      });
    }
    
    // Student specific handlers
    if (userData.userType === 'student') {
      document.getElementById('join-class-btn').addEventListener('click', () => {
        document.getElementById('join-class-modal').style.display = 'block';
      });
      
      document.getElementById('join-class-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const classCode = document.getElementById('class-code').value;
        
        try {
          await window.classAPI.joinClass(classCode);
          closeJoinClassModal();
          loadClasses();
          alert('Successfully joined the class!');
        } catch (error) {
          alert('Failed to join class: ' + error.message);
        }
      });
    }
    
    // Load classes based on user type
    async function loadClasses() {
      try {
        const result = await window.classAPI.getMyClasses();
        classes = result.data;
        renderClasses();
      } catch (error) {
        console.error('Error loading classes:', error);
      }
    }
    
    // Render classes
    function renderClasses() {
      const classesList = document.getElementById('classes-list');
      classesList.innerHTML = '';
      
      if (classes.length === 0) {
        classesList.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
            <p>${userData.userType === 'teacher' ? 'No classes yet. Create your first class!' : 'No classes yet. Join a class to get started!'}</p>
          </div>
        `;
        return;
      }
      
      classes.forEach(classItem => {
        const classCard = document.createElement('div');
        classCard.style.backgroundColor = '#F7F1EA';
        classCard.style.padding = '20px';
        classCard.style.borderRadius = '8px';
        classCard.style.cursor = 'pointer';
        classCard.style.transition = 'transform 0.2s';
        
        classCard.innerHTML = `
          <h3 style="color: #4A2707; margin-bottom: 10px;">${classItem.name}</h3>
          ${classItem.description ? `<p style="color: #666; font-size: 14px; margin-bottom: 10px;">${classItem.description}</p>` : ''}
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
            <div>
              ${userData.userType === 'teacher' ? `
                <p style="color: #4A2707; font-size: 14px; margin: 0;">Class Code: <strong>${classItem.classCode}</strong></p>
                <p style="color: #666; font-size: 12px; margin: 0;">${classItem.students.length} students</p>
              ` : `
                <p style="color: #666; font-size: 14px; margin: 0;">Teacher: ${classItem.teacherId.name}</p>
              `}
            </div>
            <button class="btn" style="padding: 6px 16px; font-size: 14px;" onclick="navigateToClassDetails('${classItem._id}')">
              View Details
            </button>
          </div>
        `;
        
        classCard.onmouseover = () => {
          classCard.style.transform = 'translateY(-2px)';
        };
        
        classCard.onmouseout = () => {
          classCard.style.transform = 'translateY(0)';
        };
        
        classesList.appendChild(classCard);
      });
    }
    
    // Navigate to class details
    window.navigateToClassDetails = (classId) => {
      userData.currentClassId = classId;
      navigateToPage('class-details');
    };
    
    // Load classes on page load
    loadClasses();
  }