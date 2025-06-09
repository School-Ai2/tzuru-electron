let currentPage = null;
let userData = {
  _id: 'placeholder_user_id',
  name: 'Demo User',
  email: 'demo@tzuru.com',
  userType: 'individual', // placeholder - can be 'student', 'teacher', 'individual'
  activeDocumentId: null,
  settings: {
    model: 'llama3.2',
    temperature: 0.7
  }
};

// Placeholder for future backend integration
async function checkAuthentication() {
  // For now, always return true since we're using the new backend
  // This will be replaced when you integrate the full backend later
  return true;
}

async function navigateToPage(page, data = {}) {
  // Update userData with any new data
  if (data.email) userData.email = data.email;
  if (data.userType) userData.userType = data.userType;
  if (data.activeDocumentId) userData.activeDocumentId = data.activeDocumentId;
  
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
      renderChatPage(container);
  }
}

function clearDocumentReferences() {
  // Clear in userData
  userData.activeDocumentId = null;
  
  // Clear in local storage
  if (window.localStorage) {
    localStorage.removeItem('tzuru_activeDocumentId');
  }
  
  console.log('All document references cleared');
}

// Placeholder logout function for UI compatibility
async function logout() {
  // Clear userData
  userData = {
    _id: 'placeholder_user_id',
    name: 'Demo User',
    email: 'demo@tzuru.com',
    userType: 'individual',
    activeDocumentId: null,
    settings: {
      model: 'llama3.2',
      temperature: 0.7
    }
  };
  
  // Navigate to login page (placeholder)
  navigateToPage('login');
}

// Make logout function global so it can be called from UI
window.logout = logout;

// Initialize app - start with chat page (skip auth for now)
document.addEventListener('DOMContentLoaded', async () => {
  // For development with new backend, go directly to chat
  // When you integrate full backend, change this to check authentication
  navigateToPage('chat');
  
  // Uncomment this line when you want to test the full UI flow:
  // navigateToPage('login');
});