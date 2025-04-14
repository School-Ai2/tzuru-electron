
let currentPage = null;
let userData = {
  email: null,
  userType: null,
  activeDocumentId: null,
  settings: {
    model: 'llama3.2',
    temperature: 0.7
  }
};

function navigateToPage(page, data = {}) {
  
  if (data.email) userData.email = data.email;
  if (data.userType) userData.userType = data.userType;
  
  currentPage = page;
  const container = document.getElementById('app-container');
  
  
  container.innerHTML = '';
  
  
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
    default:
      renderLoginPage(container);
  }
}