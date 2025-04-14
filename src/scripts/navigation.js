// src/scripts/navigation.js
let currentPage = null;
let userData = {
  email: null,
  userType: null
};

function navigateToPage(page, data = {}) {
  // Update userData if provided
  if (data.email) userData.email = data.email;
  if (data.userType) userData.userType = data.userType;
  
  currentPage = page;
  const container = document.getElementById('app-container');
  
  // Clear container
  container.innerHTML = '';
  
  // Call the appropriate render function
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
    default:
      renderLoginPage(container);
  }
}