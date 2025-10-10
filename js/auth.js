// Authentication Module
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Check authentication status
onAuthStateChanged(window.auth, (user) => {
  if (!user) {
    // Not logged in, redirect to login page
    window.location.href = 'index.html';
  } else {
    // User is logged in
    console.log('✅ User authenticated:', user.email);
    
    // Display user email in header (if element exists)
    const userEmailElement = document.getElementById('userEmail');
    if (userEmailElement) {
      userEmailElement.textContent = user.email;
    }
    
    // Add logout button to header if not exists
    addLogoutButton(user.email);
    
    // Initialize app data
    if (typeof initializeApp === 'function') {
      initializeApp();
    }
  }
});

// Add logout button to header
function addLogoutButton(email) {
  const header = document.querySelector('.header-content');
  if (header && !document.getElementById('logoutBtn')) {
    const logoutDiv = document.createElement('div');
    logoutDiv.style.marginLeft = 'auto';
    logoutDiv.style.display = 'flex';
    logoutDiv.style.alignItems = 'center';
    logoutDiv.style.gap = '15px';
    
    const userInfo = document.createElement('span');
    userInfo.style.color = '#666';
    userInfo.style.fontSize = '0.9rem';
    userInfo.textContent = email;
    
    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'logoutBtn';
    logoutBtn.textContent = '🚪 Sair';
    logoutBtn.className = 'btn-secondary';
    logoutBtn.style.padding = '8px 16px';
    logoutBtn.style.fontSize = '0.9rem';
    logoutBtn.onclick = handleLogout;
    
    logoutDiv.appendChild(userInfo);
    logoutDiv.appendChild(logoutBtn);
    header.appendChild(logoutDiv);
  }
}

// Logout function
async function handleLogout() {
  if (confirm('Deseja realmente sair do sistema?')) {
    try {
      await signOut(window.auth);
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      alert('Erro ao sair. Tente novamente.');
    }
  }
}

// Export for global use
window.handleLogout = handleLogout;

