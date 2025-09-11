// Global state
let currentUser = null;
let contacts = [];

// API Configuration
const API_BASE = ''; // Adjust this to your PHP API path
const API_ENDPOINTS = {
    login: 'LoginAPIContactMgr.php',
    register: 'RegisterAPIConctactMgr.php',
    addContact: 'addContactsAPI.php',
    searchContacts: 'SearchAPIContactMgr.php'
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showContactSection();
    } else {
        showLogin();
    }

    // Set up form event listeners
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Registration form
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // Contact form
    document.getElementById('contactForm').addEventListener('submit', handleAddContact);
}

// Authentication Functions
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const loginData = {
        username: formData.get('username'),
        password: formData.get('password')
    };

    try {
        showLoading(true);
        const response = await makeAPICall(API_ENDPOINTS.login, loginData);
        
        if (response.error) {
            showAlert('error', response.error);
        } else {
            currentUser = {
                id: response.id,
                firstName: response.firstName,
                lastName: response.lastName
            };
            
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showContactSection();
            showAlert('success', `Welcome back, ${response.firstName}!`);
        }
    } catch (error) {
        showAlert('error', 'Login failed. Please try again.');
        console.error('Login error:', error);
    } finally {
        showLoading(false);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const registerData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        username: formData.get('username'),
        password: formData.get('password')
    };

    try {
        showLoading(true);
        const response = await makeAPICall(API_ENDPOINTS.register, registerData);
        
        if (response.error) {
            showAlert('error', response.error);
        } else {
            currentUser = {
                id: response.id,
                firstName: response.firstName,
                lastName: response.lastName
            };
            
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showContactSection();
            showAlert('success', `Welcome, ${response.firstName}! Your account has been created.`);
        }
    } catch (error) {
        showAlert('error', 'Registration failed. Please try again.');
        console.error('Registration error:', error);
    } finally {
        showLoading(false);
    }
}

// Contact Management Functions
async function handleAddContact(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const contactData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        userId: currentUser.id
    };

    try {
        showLoading(true);
        const response = await makeAPICall(API_ENDPOINTS.addContact, contactData);
        
        if (response.error) {
            showAlert('error', response.error);
        } else {
            showAlert('success', 'Contact added successfully!');
            e.target.reset();
            hideAddContactForm();
            // Refresh the contacts list
            await loadContacts();
        }
    } catch (error) {
        showAlert('error', 'Failed to add contact. Please try again.');
        console.error('Add contact error:', error);
    } finally {
        showLoading(false);
    }
}

async function loadContacts() {
    if (!currentUser) return;

    try {
        showLoading(true);
        const response = await makeAPICall(API_ENDPOINTS.searchContacts, {
            userId: currentUser.id,
            search: '' // Empty search to get all contacts
        });
        
        if (response.error) {
            if (response.error === 'No Records Found') {
                contacts = [];
            } else {
                showAlert('error', response.error);
            }
        } else {
            contacts = response.results || [];
        }
        
        displayContacts();
    } catch (error) {
        showAlert('error', 'Failed to load contacts.');
        console.error('Load contacts error:', error);
    } finally {
        showLoading(false);
    }
}

async function searchContacts() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    
    if (!currentUser) return;

    try {
        showLoading(true);
        const response = await makeAPICall(API_ENDPOINTS.searchContacts, {
            userId: currentUser.id,
            search: searchTerm
        });
        
        if (response.error) {
            if (response.error === 'No Records Found') {
                contacts = [];
            } else {
                showAlert('error', response.error);
            }
        } else {
            contacts = response.results || [];
        }
        
        displayContacts();
    } catch (error) {
        showAlert('error', 'Search failed.');
        console.error('Search error:', error);
    } finally {
        showLoading(false);
    }
}

function displayContacts() {
    const contactsList = document.getElementById('contactsList');
    const noContacts = document.getElementById('noContacts');
    
    if (contacts.length === 0) {
        contactsList.style.display = 'none';
        noContacts.style.display = 'block';
        return;
    }
    
    contactsList.style.display = 'block';
    noContacts.style.display = 'none';
    
    contactsList.innerHTML = contacts.map(contact => `
        <div class="contact-card">
            <div class="contact-info">
                <h4>${escapeHtml(contact.firstName)} ${escapeHtml(contact.lastName)}</h4>
                <div class="contact-details">
                    <div><i class="fas fa-phone"></i> ${escapeHtml(contact.phone)}</div>
                    <div><i class="fas fa-envelope"></i> ${escapeHtml(contact.email)}</div>
                </div>
            </div>
            <div class="contact-actions">
                <button class="btn btn-small btn-edit" onclick="editContact(${contact.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-small btn-delete" onclick="deleteContact(${contact.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// UI Functions
function showLogin() {
    hideAllSections();
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('loginNav').style.display = 'block';
    document.getElementById('registerNav').style.display = 'block';
    document.getElementById('userNav').style.display = 'none';
}

function showRegister() {
    hideAllSections();
    document.getElementById('registerSection').style.display = 'block';
    document.getElementById('loginNav').style.display = 'block';
    document.getElementById('registerNav').style.display = 'block';
    document.getElementById('userNav').style.display = 'none';
}

function showContactSection() {
    hideAllSections();
    document.getElementById('contactSection').style.display = 'block';
    document.getElementById('loginNav').style.display = 'none';
    document.getElementById('registerNav').style.display = 'none';
    document.getElementById('userNav').style.display = 'block';
    
    // Update user info in navigation
    document.getElementById('userInfo').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    
    // Load contacts
    loadContacts();
}

function hideAllSections() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('registerSection').style.display = 'none';
    document.getElementById('contactSection').style.display = 'none';
}

function showAddContactForm() {
    document.getElementById('addContactForm').style.display = 'block';
    document.getElementById('contactForm').reset();
}

function hideAddContactForm() {
    document.getElementById('addContactForm').style.display = 'none';
}

function logout() {
    currentUser = null;
    contacts = [];
    localStorage.removeItem('currentUser');
    showLogin();
    showAlert('info', 'You have been logged out.');
}

// Utility Functions
async function makeAPICall(endpoint, data) {
    const response = await fetch(API_BASE + endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
}

function showLoading(show) {
    document.getElementById('loadingSpinner').style.display = show ? 'flex' : 'none';
}

function showAlert(type, message) {
    const alertContainer = document.getElementById('alertContainer');
    const alertId = 'alert-' + Date.now();
    
    const alert = document.createElement('div');
    alert.id = alertId;
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>${message}</span>
            <button onclick="closeAlert('${alertId}')" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; margin-left: 1rem;">&times;</button>
        </div>
    `;
    
    alertContainer.appendChild(alert);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        closeAlert(alertId);
    }, 5000);
}

function closeAlert(alertId) {
    const alert = document.getElementById(alertId);
    if (alert) {
        alert.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            alert.remove();
        }, 300);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Placeholder functions for future features
function editContact(contactId) {
    showAlert('info', 'Edit functionality coming soon!');
}

function deleteContact(contactId) {
    if (confirm('Are you sure you want to delete this contact?')) {
        showAlert('info', 'Delete functionality coming soon!');
    }
}

// Add CSS for slideOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
