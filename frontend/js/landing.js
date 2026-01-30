// API Base URL - Update this to match your backend
const API_BASE_URL = 'http://localhost:5000/api';

// Mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navRightSection = document.querySelector('.nav-right-section');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            // Toggle active class for mobile menu
            navRightSection.classList.toggle('active');
            
            // Change menu icon
            const icon = this.querySelector('i');
            if (icon.classList.contains('fa-bars')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                navRightSection.classList.remove('active');
                menuToggle.querySelector('i').classList.remove('fa-times');
                menuToggle.querySelector('i').classList.add('fa-bars');
            }
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768) {
            const isClickInsideNav = navRightSection.contains(event.target) || 
                                   menuToggle.contains(event.target) ||
                                   document.querySelector('.logo').contains(event.target);
            
            if (!isClickInsideNav && navRightSection.classList.contains('active')) {
                navRightSection.classList.remove('active');
                menuToggle.querySelector('i').classList.remove('fa-times');
                menuToggle.querySelector('i').classList.add('fa-bars');
            }
        }
    });
    
    // Initialize form submission and load projects
    initializeContactForm();
    loadProjects();
});

// Contact Form Submission Handling
function initializeContactForm() {
    const consultationForm = document.getElementById('consultationForm');
    
    if (consultationForm) {
        consultationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form values
            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                mobile: document.getElementById('mobile').value.trim(),
                city: document.getElementById('city').value.trim()
            };
            
            console.log('Form data:', formData);
            
            // Simple validation
            if (!formData.name || !formData.email || !formData.mobile || !formData.city) {
                showAlert('error', 'Please fill in all fields');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                showAlert('error', 'Please enter a valid email address');
                return;
            }
            
            // Mobile validation
            const mobileRegex = /^[0-9]{10}$/;
            const cleanMobile = formData.mobile.replace(/\D/g, '');
            if (!mobileRegex.test(cleanMobile)) {
                showAlert('error', 'Please enter a valid 10-digit mobile number');
                return;
            }
            
            // Update mobile with cleaned version
            formData.mobile = cleanMobile;
            
            // Show loading state
            const submitBtn = this.querySelector('.form-submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;
            
            try {
                console.log('Submitting to:', `${API_BASE_URL}/contact-form`);
                console.log('Form data being sent:', JSON.stringify(formData));
                
                // First, check if we can reach the API endpoint
                try {
                    const testResponse = await fetch(`${API_BASE_URL}/contact-form`, {
                        method: 'OPTIONS',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });
                    console.log('OPTIONS test response:', testResponse);
                } catch (testError) {
                    console.log('OPTIONS request failed:', testError);
                }
                
                // Submit to backend API
                const response = await fetch(`${API_BASE_URL}/contact-form`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                    mode: 'cors', // Explicitly set CORS mode
                    credentials: 'omit' // Don't send cookies
                });
                
                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers);
                
                let data;
                try {
                    data = await response.json();
                    console.log('Response data:', data);
                } catch (jsonError) {
                    console.log('Failed to parse JSON response:', jsonError);
                    throw new Error('Server returned an invalid response');
                }
                
                if (response.ok) {
                    showAlert('success', 'Thank you! Your consultation request has been submitted successfully. We\'ll contact you shortly.');
                    consultationForm.reset();
                } else {
                    showAlert('error', data.error || `Server error: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                console.error('Error details:', error.name, error.message);
                
                // More specific error messages
                let errorMessage = 'There was an error submitting your request. ';
                
                if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                    // Network error - server not reachable
                    errorMessage += 'Please check that:';
                    errorMessage += '\n1. Your backend server is running on http://localhost:5000';
                    errorMessage += '\n2. The server has CORS enabled';
                    errorMessage += '\n3. You have internet connection';
                } else if (error.message.includes('NetworkError')) {
                    errorMessage += 'Network error. Please check your internet connection.';
                } else {
                    errorMessage += 'Please try again later.';
                }
                
                showAlert('error', errorMessage);
            } finally {
                // Reset button state
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// Function to show alerts
function showAlert(type, message) {
    // Remove existing alerts
    const existingAlert = document.querySelector('.custom-alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `custom-alert alert-${type}`;
    
    // Format message to handle line breaks
    const formattedMessage = message.replace(/\n/g, '<br>');
    
    alertDiv.innerHTML = `
        <div class="alert-content">
            <span>${formattedMessage}</span>
        </div>
        <button class="alert-close">&times;</button>
    `;
    
    // Add styles
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-family: 'Poppins', sans-serif;
        font-size: 14px;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        max-width: 400px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    
    if (type === 'success') {
        alertDiv.style.backgroundColor = '#4CAF50';
    } else if (type === 'error') {
        alertDiv.style.backgroundColor = '#f44336';
    } else if (type === 'info') {
        alertDiv.style.backgroundColor = '#2196F3';
    }
    
    // Style for alert content to allow line breaks
    const alertContent = alertDiv.querySelector('.alert-content');
    alertContent.style.cssText = `
        flex: 1;
        margin-right: 10px;
    `;
    
    // Add close button functionality
    const closeBtn = alertDiv.querySelector('.alert-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        margin-left: 15px;
        flex-shrink: 0;
    `;
    
    closeBtn.addEventListener('click', () => {
        alertDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => alertDiv.remove(), 300);
    });
    
    // Auto remove after 8 seconds (longer for error messages)
    const autoRemoveTime = type === 'error' ? 10000 : 5000;
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => alertDiv.remove(), 300);
        }
    }, autoRemoveTime);
    
    // Add CSS animation if not already present
    if (!document.querySelector('#alert-animations')) {
        const style = document.createElement('style');
        style.id = 'alert-animations';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(alertDiv);
}

// Function to load and display projects
async function loadProjects() {
    const projectsContainer = document.getElementById('projects-container');
    
    if (!projectsContainer) {
        console.log('Projects container not found');
        return;
    }
    
    try {
        projectsContainer.innerHTML = '<div class="loading-projects"><div class="loading-spinner"></div><p>Loading projects...</p></div>';
        
        console.log('Fetching projects from:', `${API_BASE_URL}/projects`);
        
        const response = await fetch(`${API_BASE_URL}/projects`, {
            mode: 'cors',
            credentials: 'omit'
        });
        
        console.log('Projects response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch projects: ${response.status} ${response.statusText}`);
        }
        
        const projects = await response.json();
        console.log('Projects loaded:', projects.length);
        
        // Clear loading message
        projectsContainer.innerHTML = '';
        
        if (projects.length === 0) {
            projectsContainer.innerHTML = '<div class="no-projects"><p>No projects available yet. Check back soon!</p></div>';
            return;
        }
        
        // Create project cards
        projects.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            
            // Create image URL - handle both local and full URLs
            let imageUrl = 'assets/images/default-project.jpg'; // Default image
            
            if (project.image) {
                // Check if it's already a full URL or just a filename
                if (project.image.startsWith('http')) {
                    imageUrl = project.image;
                } else {
                    imageUrl = `http://localhost:5000/uploads/${project.image}`;
                }
            }
            
            // Truncate description if too long
            const maxDescriptionLength = 150;
            let description = project.description || 'No description available';
            if (description.length > maxDescriptionLength) {
                description = description.substring(0, maxDescriptionLength) + '...';
            }
            
            projectCard.innerHTML = `
                <div class="project-image">
                    <img src="${imageUrl}" alt="${project.name}" 
                         onerror="this.src='assets/images/default-project.jpg'; this.onerror=null;">
                </div>
                <div class="project-content">
                    <h3 class="project-title">${project.name}</h3>
                    <p class="project-description">${description}</p>
                    <button class="read-more-btn">Read More</button>
                </div>
            `;
            
            projectsContainer.appendChild(projectCard);
            
            // Add click event to Read More button
            const readMoreBtn = projectCard.querySelector('.read-more-btn');
            readMoreBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const fullDescription = project.description || 'No detailed description available.';
                showAlert('info', `<strong>${project.name}</strong><br><br>${fullDescription}`);
            });
        });
        
    } catch (error) {
        console.error('Error loading projects:', error);
        console.error('Error details:', error.name, error.message);
        
        let errorMessage = 'Unable to load projects. ';
        
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            errorMessage += 'Cannot connect to the server. Please check that:';
            errorMessage += '\n1. Your backend server is running on http://localhost:5000';
            errorMessage += '\n2. The server has CORS enabled';
            errorMessage += '\n3. You have internet connection';
        } else {
            errorMessage += error.message;
        }
        
        projectsContainer.innerHTML = `
            <div class="no-projects">
                <p>${errorMessage}</p>
                <button class="retry-btn" onclick="loadProjects()">
                    Retry Loading Projects
                </button>
            </div>
        `;
    }
}

// Make loadProjects available globally for retry button
window.loadProjects = loadProjects;

// Function to test backend connection
async function testBackendConnection() {
    try {
        console.log('Testing connection to backend...');
        const response = await fetch(`${API_BASE_URL}/health-check`, {
            method: 'GET',
            mode: 'cors',
            credentials: 'omit'
        });
        
        if (response.ok) {
            console.log('Backend connection successful');
            return true;
        }
        return false;
    } catch (error) {
        console.log('Backend connection failed:', error);
        return false;
    }
}
// Add this to your landing.js
async function testBackendConnection() {
    try {
        console.log('🔍 Testing backend connection...');
        const response = await fetch(`${API_BASE_URL}/health-check`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Backend connected:', data);
            return true;
        } else {
            console.error('❌ Backend health check failed');
            return false;
        }
    } catch (error) {
        console.error('❌ Cannot connect to backend:', error);
        console.log('💡 Make sure:');
        console.log('   1. Backend server is running on port 5000');
        console.log('   2. MongoDB is running (run: mongod)');
        console.log('   3. No firewall blocking the connection');
        return false;
    }
}

// Update your DOMContentLoaded to test connection first
document.addEventListener('DOMContentLoaded', function() {
    // ... existing mobile menu code ...
    
    // Test backend connection first
    testBackendConnection().then(isConnected => {
        if (isConnected) {
            console.log('✅ Backend connected, initializing forms...');
            initializeContactForm();
            loadProjects();
            loadClients(); // Add this if you have clients section
        } else {
            console.error('❌ Backend not connected, forms will not work');
            showAlert('error', 'Cannot connect to server. Forms will not work until backend is running.');
        }
    });
});
// You can call this function to test connection
window.testBackendConnection = testBackendConnection;

// Function to load and display clients
async function loadClients() {
    const clientsContainer = document.getElementById('clients-container');
    
    if (!clientsContainer) {
        console.log('Clients container not found');
        return;
    }
    
    try {
        clientsContainer.innerHTML = '<div class="loading-clients"><div class="loading-spinner"></div><p>Loading clients...</p></div>';
        
        console.log('Fetching clients from:', `${API_BASE_URL}/clients`);
        
        const response = await fetch(`${API_BASE_URL}/clients`, {
            mode: 'cors',
            credentials: 'omit'
        });
        
        console.log('Clients response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch clients: ${response.status} ${response.statusText}`);
        }
        
        const clients = await response.json();
        console.log('Clients loaded:', clients.length);
        
        // Clear loading message
        clientsContainer.innerHTML = '';
        
        if (clients.length === 0) {
            clientsContainer.innerHTML = '<div class="no-clients"><p>No client testimonials available yet. Check back soon!</p></div>';
            return;
        }
        
        // Create client cards
        clients.forEach(client => {
            const clientCard = document.createElement('div');
            clientCard.className = 'client-card';
            
            // Create image URL - handle both local and full URLs
            let imageUrl = 'assets/images/default-client.jpg'; // Default image
            
            if (client.image) {
                // Check if it's already a full URL or just a filename
                if (client.image.startsWith('http')) {
                    imageUrl = client.image;
                } else {
                    imageUrl = `http://localhost:5000/uploads/${client.image}`;
                }
            }
            
            // Truncate description if too long
            const maxDescriptionLength = 200;
            let description = client.description || 'No testimonial available';
            if (description.length > maxDescriptionLength) {
                description = description.substring(0, maxDescriptionLength) + '...';
            }
            
            clientCard.innerHTML = `
                <div class="client-image">
                    <img src="${imageUrl}" alt="${client.name}" 
                         onerror="this.src='assets/images/default-client.jpg'; this.onerror=null;">
                </div>
                <div class="client-content">
                    <p class="client-description">"${description}"</p>
                    <h3 class="client-name">${client.name}</h3>
                    <p class="client-designation">${client.designation}</p>
                </div>
            `;
            
            clientsContainer.appendChild(clientCard);
        });
        
    } catch (error) {
        console.error('Error loading clients:', error);
        console.error('Error details:', error.name, error.message);
        
        let errorMessage = 'Unable to load clients. ';
        
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            errorMessage += 'Cannot connect to the server.';
        } else {
            errorMessage += error.message;
        }
        
        clientsContainer.innerHTML = `
            <div class="no-clients">
                <p>${errorMessage}</p>
                <button class="retry-btn" onclick="loadClients()">
                    Retry Loading Clients
                </button>
            </div>
        `;
    }
}

// Make loadClients available globally for retry button
window.loadClients = loadClients;

// Subscribe Form Handling
function initializeSubscribeForm() {
    const subscribeForm = document.getElementById('subscribeForm');
    
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('.subscribe-input');
            const email = emailInput.value.trim();
            
            // Validation
            if (!email) {
                showAlert('error', 'Please enter your email address');
                return;
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showAlert('error', 'Please enter a valid email address');
                return;
            }
            
            // Show loading state
            const submitBtn = this.querySelector('.subscribe-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Subscribing...';
            submitBtn.disabled = true;
            
            try {
                const response = await fetch(`${API_BASE_URL}/subscribers`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: email }),
                    mode: 'cors'
                });
                
                let data;
                try {
                    data = await response.json();
                } catch (jsonError) {
                    throw new Error('Invalid server response');
                }
                
                if (response.ok) {
                    showAlert('success', 'Thank you for subscribing!');
                    emailInput.value = '';
                    
                    // If you want to track subscriptions locally
                    const subscriptions = JSON.parse(localStorage.getItem('newsletterSubscriptions') || '[]');
                    subscriptions.push({
                        email: email,
                        subscribedAt: new Date().toISOString()
                    });
                    localStorage.setItem('newsletterSubscriptions', JSON.stringify(subscriptions));
                    
                } else {
                    if (data.error && data.error.includes('already subscribed')) {
                        showAlert('info', 'You are already subscribed to our newsletter!');
                        emailInput.value = '';
                    } else {
                        showAlert('error', data.error || 'Failed to subscribe. Please try again.');
                    }
                }
            } catch (error) {
                console.error('Error subscribing:', error);
                
                // Fallback to localStorage if server is down
                const subscriptions = JSON.parse(localStorage.getItem('newsletterSubscriptions') || '[]');
                const alreadySubscribed = subscriptions.some(sub => sub.email === email);
                
                if (alreadySubscribed) {
                    showAlert('info', 'You are already subscribed!');
                } else {
                    subscriptions.push({
                        email: email,
                        subscribedAt: new Date().toISOString(),
                        pendingSync: true
                    });
                    localStorage.setItem('newsletterSubscriptions', JSON.stringify(subscriptions));
                    showAlert('success', 'Subscribed successfully! (Saved locally)');
                }
                
                emailInput.value = '';
            } finally {
                // Reset button state
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// Also initialize the Learn More button
function initializeLearnMoreButton() {
    const learnMoreBtn = document.querySelector('.learn-more-btn');
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', function() {
            // Scroll to about section or show more info
            const aboutSection = document.querySelector('#about');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                showAlert('info', 'Learn more about our services and projects!');
            }
        });
    }
}

// Update your DOMContentLoaded function to include these
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    
    // Add these lines
    initializeSubscribeForm();
    initializeLearnMoreButton();
    
    // ... rest of your code ...
});