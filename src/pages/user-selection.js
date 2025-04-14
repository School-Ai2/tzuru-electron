// src/pages/user-selection.js
function renderUserSelectionPage(container) {
    container.innerHTML = `
      <div class="container flex flex-center flex-column" style="height: 100vh;">
        <div class="logo-container">
          <img src="src/assets/images/logo.png" alt="Tzuru Logo" class="logo">
          <h1 style="margin-left: 15px; color: #4A2707;">Tzuru</h1>
        </div>
        
        <div class="card" style="width: 700px;">
          <h2 class="text-center mb-20">How will you be using Tzuru?</h2>
          <p class="text-center mb-20">
            Select your role to personalize your experience
          </p>
          
          <div class="user-type-selection">
            <div class="card user-type-card" data-type="student">
              <div class="feature-icon">👨‍🎓</div>
              <h3>Student</h3>
              <p class="text-center">Learn at your own pace with AI assistance</p>
            </div>
            
            <div class="card user-type-card" data-type="teacher">
              <div class="feature-icon">👩‍🏫</div>
              <h3>Teacher</h3>
              <p class="text-center">Support your classroom with AI tools</p>
            </div>
            
            <div class="card user-type-card" data-type="individual">
              <div class="feature-icon">👤</div>
              <h3>Individual</h3>
              <p class="text-center">Personal learning with customizable AI</p>
            </div>
          </div>
          
          <div class="text-center mt-20">
            <button 
              class="btn"
              id="continue-btn"
              disabled
              style="opacity: 0.6; cursor: not-allowed;"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Get DOM elements
    const userTypeCards = document.querySelectorAll('.user-type-card');
    const continueBtn = document.getElementById('continue-btn');
    let selectedType = null;
    
    // Handle card selection
    userTypeCards.forEach(card => {
      card.addEventListener('click', () => {
        // Remove selected class from all cards
        userTypeCards.forEach(c => c.classList.remove('selected'));
        
        // Add selected class to clicked card
        card.classList.add('selected');
        
        // Enable continue button
        continueBtn.disabled = false;
        continueBtn.style.opacity = '1';
        continueBtn.style.cursor = 'pointer';
        
        // Store selected type
        selectedType = card.dataset.type;
      });
    });
    
    // Handle continue button click
    continueBtn.addEventListener('click', () => {
      if (selectedType) {
        // Navigate to welcome guide with selected user type
        navigateToPage('welcome-guide', { userType: selectedType });
      }
    });
  }