// src/pages/login.js
function renderLoginPage(container) {
    container.innerHTML = `
      <div class="container flex flex-center flex-column" style="height: 100vh;">
        <div class="logo-container">
          <img src="src/assets/images/logo.png" alt="Tzuru Logo" class="logo">
          <h1 style="margin-left: 15px; color: #4A2707;">Tzuru</h1>
        </div>
        
        <div class="card" style="width: 400px;">
          <h2 class="text-center mb-20" id="auth-title">Login to Tzuru</h2>
          
          <div id="error-message" style="display: none; background-color: #ffdddd; color: #dc3545; padding: 10px; border-radius: 5px; margin-bottom: 15px;"></div>
          
          <form id="auth-form">
            <div id="name-field" style="display: none;" class="form-group">
              <label for="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                class="form-control"
                placeholder="Enter your full name"
              />
            </div>
            
            <div class="form-group">
              <label for="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                class="form-control"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                class="form-control"
                placeholder="Enter your password"
                required
              />
            </div>
            
            <div id="confirm-password-field" style="display: none;" class="form-group">
              <label for="confirm-password">Confirm Password</label>
              <input
                type="password"
                id="confirm-password"
                name="confirm-password"
                class="form-control"
                placeholder="Confirm your password"
              />
            </div>
            
            <button type="submit" class="btn" style="width: 100%; margin-top: 20px;">
              Login
            </button>
          </form>
          
          <div class="text-center mt-20">
            <p>
              Don't have an account?
              <button
                type="button"
                id="toggle-auth-btn"
                style="background: none; border: none; color: #F47834; cursor: pointer; margin-left: 5px;"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
        
        <p class="text-center mt-20" style="color: #666;">
          Tzuru - Empowering students. Supporting teachers. With AI.
        </p>
      </div>
    `;
    
    // Get DOM elements
    const authForm = document.getElementById('auth-form');
    const authTitle = document.getElementById('auth-title');
    const toggleAuthBtn = document.getElementById('toggle-auth-btn');
    const nameField = document.getElementById('name-field');
    const confirmPasswordField = document.getElementById('confirm-password-field');
    const errorMessage = document.getElementById('error-message');
    
    let isSignUp = false;
    
    // Toggle between login and signup
    toggleAuthBtn.addEventListener('click', () => {
      isSignUp = !isSignUp;
      
      if (isSignUp) {
        authTitle.textContent = 'Create Account';
        nameField.style.display = 'block';
        confirmPasswordField.style.display = 'block';
        authForm.querySelector('button').textContent = 'Sign Up';
        toggleAuthBtn.textContent = 'Login';
        document.querySelector('.text-center.mt-20 p').innerHTML = 'Already have an account? <button type="button" id="toggle-auth-btn" style="background: none; border: none; color: #F47834; cursor: pointer; margin-left: 5px;">Login</button>';
      } else {
        authTitle.textContent = 'Login to Tzuru';
        nameField.style.display = 'none';
        confirmPasswordField.style.display = 'none';
        authForm.querySelector('button').textContent = 'Login';
        toggleAuthBtn.textContent = 'Sign Up';
        document.querySelector('.text-center.mt-20 p').innerHTML = 'Don\'t have an account? <button type="button" id="toggle-auth-btn" style="background: none; border: none; color: #F47834; cursor: pointer; margin-left: 5px;">Sign Up</button>';
      }
      
      // Re-attach event listener to new button
      document.getElementById('toggle-auth-btn').addEventListener('click', toggleAuthBtn.onclick);
    });
    
    // Handle form submission
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      // Basic validation
      if (!email || !password) {
        errorMessage.textContent = 'Please fill in all required fields';
        errorMessage.style.display = 'block';
        return;
      }
      
      if (isSignUp) {
        const name = document.getElementById('name').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (!name) {
          errorMessage.textContent = 'Please enter your name';
          errorMessage.style.display = 'block';
          return;
        }
        
        if (password !== confirmPassword) {
          errorMessage.textContent = 'Passwords do not match';
          errorMessage.style.display = 'block';
          return;
        }
      }
      
      // Clear any errors
      errorMessage.style.display = 'none';
      
      // Store email in userData and navigate to user selection
      navigateToPage('user-selection', { email: email });
    });
  }