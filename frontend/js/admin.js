// API Base URL
const API_BASE_URL = ' https://real-trust-8inu.onrender.com/api';

// DOM Elements
const addProjectForm = document.getElementById('add-project-form');
const projectsList = document.getElementById('projects-list');
const addClientForm = document.getElementById('add-client-form');
const clientsList = document.getElementById('clients-list');
const contactsList = document.getElementById('contacts-list');
const subscribersList = document.getElementById('subscribers-list');

// Convert File to Base64
function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result;
            // Extract Base64 part (remove data:image/jpeg;base64, prefix)
            const base64Data = result.split(',')[1];
            resolve({
                base64: base64Data,
                type: file.type
            });
        };
        reader.onerror = error => reject(error);
    });
}

// Show alert function
function showAlert(type, message) {
    // Remove existing alerts
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Insert after the first h2 in admin section
    const adminSection = document.querySelector('.admin-section[style="display: block;"]');
    if (adminSection) {
        adminSection.insertBefore(alertDiv, adminSection.querySelector('h2').nextSibling);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// Handle project form submission
addProjectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('project-name').value.trim();
    const description = document.getElementById('project-description').value.trim();
    const imageFile = document.getElementById('project-image').files[0];
    
    if (!name || !description) {
        showAlert('error', 'Please fill in all required fields');
        return;
    }
    
    if (!imageFile) {
        showAlert('error', 'Please select an image file');
        return;
    }
    
    // Show loading
    const submitBtn = addProjectForm.querySelector('.btn-primary');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
    submitBtn.disabled = true;
    
    try {
        console.log('📤 Adding project...');
        
        // Convert image to Base64
        const imageData = await convertFileToBase64(imageFile);
        
        // Prepare request data
        const projectData = {
            name,
            description,
            imageBase64: imageData.base64,
            imageType: imageData.type
        };
        
        console.log('Sending project data (image size):', imageData.base64.length);
        
        const response = await fetch(`${API_BASE_URL}/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(projectData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Project added successfully');
            showAlert('success', 'Project added successfully!');
            addProjectForm.reset();
            await loadAdminProjects();
        } else {
            console.error('❌ Failed to add project:', data);
            showAlert('error', `Error: ${data.error || 'Failed to add project'}`);
        }
    } catch (error) {
        console.error('❌ Error adding project:', error);
        showAlert('error', 'An error occurred. Please check console.');
    } finally {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Handle client form submission
addClientForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('client-name').value.trim();
    const description = document.getElementById('client-description').value.trim();
    const designation = document.getElementById('client-designation').value.trim();
    const imageFile = document.getElementById('client-image').files[0];
    
    if (!name || !description || !designation) {
        showAlert('error', 'Please fill in all required fields');
        return;
    }
    
    if (!imageFile) {
        showAlert('error', 'Please select an image file');
        return;
    }
    
    // Show loading
    const submitBtn = addClientForm.querySelector('.btn-primary');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
    submitBtn.disabled = true;
    
    try {
        console.log('📤 Adding client...');
        
        // Convert image to Base64
        const imageData = await convertFileToBase64(imageFile);
        
        // Prepare request data
        const clientData = {
            name,
            description,
            designation,
            imageBase64: imageData.base64,
            imageType: imageData.type
        };
        
        console.log('Sending client data (image size):', imageData.base64.length);
        
        const response = await fetch(`${API_BASE_URL}/clients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(clientData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Client added successfully');
            showAlert('success', 'Client added successfully!');
            addClientForm.reset();
            await loadAdminClients();
        } else {
            console.error('❌ Failed to add client:', data);
            showAlert('error', `Error: ${data.error || 'Failed to add client'}`);
        }
    } catch (error) {
        console.error('❌ Error adding client:', error);
        showAlert('error', 'An error occurred. Please check console.');
    } finally {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Load projects for admin
async function loadAdminProjects() {
    try {
        console.log('📥 Loading projects...');
        const response = await fetch(`${API_BASE_URL}/projects`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch projects: ${response.status}`);
        }
        
        const projects = await response.json();
        console.log(`✅ Loaded ${projects.length} projects`);
        
        projectsList.innerHTML = '';
        
        if (projects.length === 0) {
            projectsList.innerHTML = '<div class="empty-state"><i class="fas fa-building"></i><p>No projects yet. Add your first project!</p></div>';
            return;
        }
        
        projects.forEach(project => {
            const projectItem = document.createElement('div');
            projectItem.className = 'project-item';
            
            const date = new Date(project.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            const shortDescription = project.description.length > 100 
                ? project.description.substring(0, 100) + '...'
                : project.description;
            
            // Use imageUrl from backend (Base64 data URL)
            const imageHtml = project.imageUrl 
                ? `<img src="${project.imageUrl}" alt="${project.name}" style="max-width: 100px; max-height: 100px; margin-top: 10px; border-radius: 5px; object-fit: cover;">`
                : '';
            
            projectItem.innerHTML = `
                <div>
                    <strong>${project.name}</strong>
                    <p>${shortDescription}</p>
                    <small>Added: ${date}</small>
                    ${imageHtml}
                </div>
                <button class="delete-btn" onclick="deleteProject('${project._id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            `;
            
            projectsList.appendChild(projectItem);
        });
    } catch (error) {
        console.error('❌ Error loading projects:', error);
        projectsList.innerHTML = '<div class="alert alert-error"><i class="fas fa-exclamation-circle"></i><p>Error loading projects. Please check console.</p></div>';
    }
}

// Load clients for admin
async function loadAdminClients() {
    try {
        console.log('📥 Loading clients...');
        const response = await fetch(`${API_BASE_URL}/clients`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch clients: ${response.status}`);
        }
        
        const clients = await response.json();
        console.log(`✅ Loaded ${clients.length} clients`);
        
        clientsList.innerHTML = '';
        
        if (clients.length === 0) {
            clientsList.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><p>No clients yet. Add your first client!</p></div>';
            return;
        }
        
        clients.forEach(client => {
            const clientItem = document.createElement('div');
            clientItem.className = 'client-item';
            
            const date = new Date(client.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            const shortDescription = client.description.length > 100 
                ? client.description.substring(0, 100) + '...'
                : client.description;
            
            // Use imageUrl from backend (Base64 data URL)
            const imageHtml = client.imageUrl 
                ? `<img src="${client.imageUrl}" alt="${client.name}" style="width: 80px; height: 80px; margin-top: 10px; border-radius: 50%; object-fit: cover;">`
                : '';
            
            clientItem.innerHTML = `
                <div>
                    <strong>${client.name}</strong>
                    <p>${client.designation}</p>
                    <p>${shortDescription}</p>
                    <small>Added: ${date}</small>
                    ${imageHtml}
                </div>
                <button class="delete-btn" onclick="deleteClient('${client._id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            `;
            
            clientsList.appendChild(clientItem);
        });
    } catch (error) {
        console.error('❌ Error loading clients:', error);
        clientsList.innerHTML = '<div class="alert alert-error"><i class="fas fa-exclamation-circle"></i><p>Error loading clients. Please check console.</p></div>';
    }
}

// Load contact forms
async function loadContacts() {
    try {
        const response = await fetch(`${API_BASE_URL}/contact`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch contacts: ${response.status}`);
        }
        
        const contacts = await response.json();
        
        contactsList.innerHTML = '';
        
        if (contacts.length === 0) {
            contactsList.innerHTML = '<div class="empty-state"><i class="fas fa-envelope"></i><p>No contact submissions yet.</p></div>';
            return;
        }
        
        contacts.forEach(contact => {
            const contactItem = document.createElement('div');
            contactItem.className = 'contact-item';
            
            const date = new Date(contact.submittedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            contactItem.innerHTML = `
                <div>
                    <strong>${contact.fullName}</strong>
                    <p><i class="fas fa-envelope"></i> ${contact.email}</p>
                    <p><i class="fas fa-phone"></i> ${contact.mobileNumber}</p>
                    <p><i class="fas fa-city"></i> ${contact.city}</p>
                    <small><i class="fas fa-clock"></i> ${date}</small>
                </div>
                <button class="delete-btn" onclick="deleteContact('${contact._id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            `;
            
            contactsList.appendChild(contactItem);
        });
    } catch (error) {
        console.error('Error loading contacts:', error);
        contactsList.innerHTML = '<div class="alert alert-error"><i class="fas fa-exclamation-circle"></i><p>Error loading contacts.</p></div>';
    }
}

// Load subscribers
async function loadSubscribers() {
    try {
        const response = await fetch(`${API_BASE_URL}/subscribers`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch subscribers: ${response.status}`);
        }
        
        const subscribers = await response.json();
        
        subscribersList.innerHTML = '';
        
        if (subscribers.length === 0) {
            subscribersList.innerHTML = '<div class="empty-state"><i class="fas fa-newspaper"></i><p>No subscribers yet.</p></div>';
            return;
        }
        
        subscribers.forEach(subscriber => {
            const subscriberItem = document.createElement('div');
            subscriberItem.className = 'subscriber-item';
            
            const date = new Date(subscriber.subscribedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            subscriberItem.innerHTML = `
                <div>
                    <strong>${subscriber.email}</strong>
                    <small><i class="fas fa-calendar"></i> Subscribed: ${date}</small>
                </div>
                <button class="delete-btn" onclick="deleteSubscriber('${subscriber._id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            `;
            
            subscribersList.appendChild(subscriberItem);
        });
    } catch (error) {
        console.error('Error loading subscribers:', error);
        subscribersList.innerHTML = '<div class="alert alert-error"><i class="fas fa-exclamation-circle"></i><p>Error loading subscribers.</p></div>';
    }
}

// Delete functions
async function deleteProject(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showAlert('success', 'Project deleted successfully!');
            await loadAdminProjects();
        } else {
            const error = await response.json();
            showAlert('error', `Error: ${error.error}`);
        }
    } catch (error) {
        console.error('Error deleting project:', error);
        showAlert('error', 'Error deleting project.');
    }
}

async function deleteClient(id) {
    if (!confirm('Are you sure you want to delete this client?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showAlert('success', 'Client deleted successfully!');
            await loadAdminClients();
        } else {
            const error = await response.json();
            showAlert('error', `Error: ${error.error}`);
        }
    } catch (error) {
        console.error('Error deleting client:', error);
        showAlert('error', 'Error deleting client.');
    }
}

async function deleteContact(id) {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/contact/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showAlert('success', 'Contact deleted successfully!');
            await loadContacts();
        } else {
            const error = await response.json();
            showAlert('error', `Error: ${error.error}`);
        }
    } catch (error) {
        console.error('Error deleting contact:', error);
        showAlert('error', 'Error deleting contact.');
    }
}

async function deleteSubscriber(id) {
    if (!confirm('Are you sure you want to delete this subscriber?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/subscribers/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showAlert('success', 'Subscriber deleted successfully!');
            await loadSubscribers();
        } else {
            const error = await response.json();
            showAlert('error', `Error: ${error.error}`);
        }
    } catch (error) {
        console.error('Error deleting subscriber:', error);
        showAlert('error', 'Error deleting subscriber.');
    }
}

// Admin navigation
document.querySelectorAll('.admin-nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        // Don't prevent default for index.html link
        if (link.getAttribute('href') === 'index.html') {
            return true;
        }
        
        e.preventDefault();
        
        // Update active link
        document.querySelectorAll('.admin-nav a').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Hide all sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Show clicked section
        const targetId = link.getAttribute('href').substring(1);
        document.getElementById(targetId).style.display = 'block';
    });
});

// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin panel initialized');
    
    // Set active nav link
    document.querySelector('.admin-nav a[href="#projects"]').classList.add('active');
    
    // Load all data
    loadAdminProjects();
    loadAdminClients();
    loadContacts();
    loadSubscribers();
    
    // Show projects section by default
    document.getElementById('projects').style.display = 'block';
});

// Make functions available globally
window.deleteProject = deleteProject;
window.deleteClient = deleteClient;
window.deleteContact = deleteContact;
window.deleteSubscriber = deleteSubscriber;