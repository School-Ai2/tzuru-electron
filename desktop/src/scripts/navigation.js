let currentPage = null;
let userData = {
  _id: null,
  name: null,
  email: null,
  userType: null,
  activeDocumentId: null,
  settings: {
    model: 'gemma3:4b',
    temperature: 0.7
  }
};

// Check for existing auth token on app load
async function checkAuthentication() {
  const token = window.localStorage.getItem('tzuru_token');
  
  if (token) {
    try {
      // Set token in main process
      if (window.electronAPI && window.electronAPI.setAuthToken) {
        await window.electronAPI.setAuthToken(token);
      }
      
      // Get user profile from API
      const response = await window.authAPI.getProfile();
      
      // Update userData with profile info
      userData = {
        ...userData,
        _id: response.user._id,
        name: response.user.name,
        email: response.user.email,
        userType: response.user.userType,
        settings: response.user.settings || userData.settings
      };
      
      return true;
    } catch (error) {
      console.error('Authentication error:', error);
      // Clear invalid token
      window.localStorage.removeItem('tzuru_token');
      return false;
    }
  }
  
  return false;
}

async function navigateToPage(page, data = {}) {
  // Check if user is authenticated for protected pages
  const protectedPages = ['chat', 'documents', 'settings'];
  
  if (protectedPages.includes(page)) {
    const isAuthenticated = await checkAuthentication();
    
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      currentPage = 'login';
      renderLoginPage(document.getElementById('app-container'));
      return;
    }
  }
  
  // Update userData with any new data
  if (data.email) userData.email = data.email;
  if (data.userType) userData.userType = data.userType;
  
  currentPage = page;
  const container = document.getElementById('app-container');
  
  // Clear container
  container.innerHTML = '';
  
  // Render the appropriate page
  switch (page) {
    case 'login':
      renderLoginPage(container);
      break;
    case 'user-selection':
      renderUserSelectionPage(container);
      break;
    case 'welcome-guide':
      renderWelcomeGuidePage(container, data.userType);
      break;
    case 'chat':
      renderChatPage(container);
      break;
    case 'documents':
      renderDocumentsPage(container);
      break;
    case 'settings':
      renderSettingsPage(container);
      break;
    case 'classes':
      renderClassesPage(container);
      break;
    case 'class-details':
      renderClassDetailsPage(container);
      break;
    default:
      renderLoginPage(container);
  }
}

function clearDocumentReferences() {
  // Clear in userData
  userData.activeDocumentId = null;
  userData.deletedDocumentIds = [];
  
  // Clear in local storage if you're using it
  if (window.localStorage) {
    localStorage.removeItem('tzuru_activeDocumentId');
  }
  
  console.log('All document references cleared');
}

// Handle logout
async function logout() {
  // Clear token and userData
  window.localStorage.removeItem('tzuru_token');
  
  // Clear auth token in main process
  if (window.electronAPI && window.electronAPI.logout) {
    await window.electronAPI.logout();
  }
  
  userData = {
    _id: null,
    name: null,
    email: null,
    userType: null,
    activeDocumentId: null,
    settings: {
      model: 'gemma3:4b',
      temperature: 0.7
    }
  };
  
  // Navigate to login page
  navigateToPage('login');
}

// Make logout function global so it can be called from UI
window.logout = logout;

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
  // Check if user is already authenticated
  const isAuthenticated = await checkAuthentication();
  
  if (isAuthenticated && userData.userType) {
    // Navigate to chat page if already authenticated and has user type
    navigateToPage('chat');
  } else if (isAuthenticated) {
    // Navigate to user selection if authenticated but no user type
    navigateToPage('user-selection');
  } else {
    // Navigate to login page if not authenticated
    navigateToPage('login');
  }
});