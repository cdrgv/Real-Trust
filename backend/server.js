const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Import routes
const projectRoutes = require('./routes/projectRoutes');
const clientRoutes = require('./routes/clientRoutes');
const contactRoutes = require('./routes/contactRoutes');
const subscriberRoutes = require('./routes/subscriberRoutes');

// Import models
const Contact = require('./models/Contact');
const Project = require('./models/Project');
const Client = require('./models/Client');
const Subscriber = require('./models/Subscriber');

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Created uploads directory');
}

// Middleware - Fix CORS to allow all origins for development
app.use(cors({
    origin: '*', // Allow all origins for development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection - SIMPLIFIED without deprecated options
const connectDB = async () => {
    try {
        console.log('🔗 Attempting to connect to MongoDB...');
        
        // Remove any deprecated options
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://fullstack:fullstack2006@cluster0.jc9cbnh.mongodb.net/');
        
        console.log(`✅ MongoDB Connected Successfully!`);
        console.log(`   Host: ${conn.connection.host}`);
        console.log(`   Database: ${conn.connection.name}`);
        console.log(`   Port: ${conn.connection.port}`);
        
        return conn;
    } catch (err) {
        console.error('❌ FATAL: MongoDB connection failed!');
        console.error(`   Error: ${err.message}`);
        
        console.log('\n🔧 TROUBLESHOOTING STEPS:');
        console.log('===================================');
        console.log('1. CHECK if MongoDB is installed:');
        console.log('   Run: mongod --version');
        console.log('');
        console.log('2. START MongoDB Service (Windows):');
        console.log('   Open PowerShell as Administrator and run:');
        console.log('   > Start-Service MongoDB');
        console.log('   OR in Command Prompt as Admin:');
        console.log('   > net start MongoDB');
        console.log('');
        console.log('3. START MongoDB manually:');
        console.log('   Open a new terminal and run:');
        console.log('   > mongod');
        console.log('   (Keep this terminal open)');
        console.log('');
        console.log('4. ALTERNATIVE: Use MongoDB Atlas (Cloud):');
        console.log('   - Sign up at https://mongodb.com/atlas');
        console.log('   - Create free cluster');
        console.log('   - Get connection string');
        console.log('   - Update MONGODB_URI in .env file');
        console.log('');
        console.log('5. TEST MongoDB connection manually:');
        console.log('   Open new terminal and run:');
        console.log('   > mongo');
        console.log('   If it connects, MongoDB is running');
        console.log('===================================\n');
        
        console.log('💡 For now, server will start WITHOUT database.');
        console.log('   Basic routes will work but database operations will fail.');
        
        // Don't exit - let server start without DB for now
        return null;
    }
};

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/subscribers', subscriberRoutes);

// Contact form submission from hero section - MODIFIED to work without DB
app.post('/api/contact-form', async (req, res) => {
    try {
        console.log('📝 Contact form submission received');
        console.log('📦 Request body:', req.body);
        
        const { name, email, mobile, city } = req.body;

        // Validation
        if (!name || !email || !mobile || !city) {
            console.log('❌ Validation failed - missing fields');
            return res.status(400).json({ 
                error: 'All fields are required',
                received: { name, email, mobile, city }
            });
        }

        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('❌ Invalid email format');
            return res.status(400).json({ error: 'Please enter a valid email address' });
        }

        // Mobile validation
        const mobileRegex = /^[0-9]{10}$/;
        const cleanMobile = mobile.replace(/\D/g, '');
        if (!mobileRegex.test(cleanMobile)) {
            console.log('❌ Invalid mobile number');
            return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number' });
        }

        // Check if MongoDB is connected
        if (mongoose.connection.readyState !== 1) {
            console.log('⚠️ MongoDB not connected - returning mock response');
            return res.status(201).json({ 
                success: true,
                message: 'Contact form submitted successfully! (Database not connected - this is a test response)',
                data: {
                    id: 'mock_' + Date.now(),
                    name: name,
                    email: email,
                    submittedAt: new Date().toISOString()
                }
            });
        }

        // Check if contact already exists with this email
        const existingContact = await Contact.findOne({ email });
        if (existingContact) {
            console.log('⚠️ Contact already exists with this email');
            return res.status(400).json({ 
                error: 'You have already submitted a contact form with this email',
                message: 'We have received your inquiry and will contact you shortly.'
            });
        }

        // Create new contact
        const contact = new Contact({
            fullName: name,
            email: email,
            mobileNumber: cleanMobile,
            city: city
        });

        const savedContact = await contact.save();
        
        console.log('✅ Contact saved successfully:', savedContact._id);
        
        res.status(201).json({ 
            success: true,
            message: 'Contact form submitted successfully! We will get back to you shortly.',
            data: {
                id: savedContact._id,
                name: savedContact.fullName,
                email: savedContact.email,
                submittedAt: savedContact.submittedAt
            }
        });
        
    } catch (error) {
        console.error('❌ Error submitting contact form:', error.message);
        
        // If database error, return mock response
        if (error.name === 'MongoError' || error.name === 'MongooseError') {
            console.log('⚠️ Database error - returning mock response');
            return res.status(201).json({ 
                success: true,
                message: 'Contact form submitted successfully! (Database error - this is a test response)',
                data: {
                    id: 'mock_' + Date.now(),
                    name: req.body.name,
                    email: req.body.email,
                    submittedAt: new Date().toISOString()
                }
            });
        }
        
        res.status(500).json({ 
            error: 'Failed to submit contact form',
            details: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health-check', (req, res) => {
    const mongodbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    console.log(`🩺 Health check - MongoDB: ${mongodbStatus}`);
    res.status(200).json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        mongodb: mongodbStatus,
        server: 'running',
        port: PORT
    });
});

// Test endpoint to verify server is working
app.get('/api/test', (req, res) => {
    console.log('🧪 Test endpoint hit');
    res.json({ 
        message: 'Red Trust API is working',
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        endpoints: {
            projects: '/api/projects',
            clients: '/api/clients',
            contact: '/api/contact',
            subscribers: '/api/subscribers',
            contactForm: '/api/contact-form',
            healthCheck: '/api/health-check'
        }
    });
});

// Mock data endpoints for testing without DB
app.get('/api/projects-mock', (req, res) => {
    const mockProjects = [
        {
            _id: '1',
            name: 'Sample Project 1',
            description: 'This is a sample project description for testing without database.',
            image: 'sample1.jpg',
            createdAt: new Date()
        },
        {
            _id: '2',
            name: 'Sample Project 2',
            description: 'Another sample project for demonstration purposes.',
            image: 'sample2.jpg',
            createdAt: new Date()
        }
    ];
    res.json(mockProjects);
});

app.get('/api/clients-mock', (req, res) => {
    const mockClients = [
        {
            _id: '1',
            name: 'John Doe',
            designation: 'CEO, TechCorp',
            description: 'Excellent service! Highly recommended.',
            image: 'client1.jpg',
            createdAt: new Date()
        },
        {
            _id: '2',
            name: 'Jane Smith',
            designation: 'Marketing Director',
            description: 'Professional team with great results.',
            image: 'client2.jpg',
            createdAt: new Date()
        }
    ];
    res.json(mockClients);
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'Red Trust API is running',
        version: '1.0.0',
        status: 'OK',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        endpoints: '/api/test'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Server error:', err.message);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: err.message
    });
});

// Handle 404 routes
app.use((req, res) => {
    console.log(`❓ 404 - Route not found: ${req.method} ${req.url}`);
    res.status(404).json({ 
        error: 'Endpoint not found',
        requested: `${req.method} ${req.url}`,
        available: '/api/test'
    });
});

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
    console.log('🚀 Starting Red Trust API Server...');
    console.log('===================================');
    
    // Try to connect to DB but don't fail if it doesn't work
    await connectDB();
    
    app.listen(PORT, () => {
        console.log(`
✅ ============================================
✅ Server is running on port ${PORT}
✅ ============================================
🔗 API Base URL: http://localhost:${PORT}
📁 Uploads directory: http://localhost:${PORT}/uploads
🧪 Test endpoint: http://localhost:${PORT}/api/test
🩺 Health check: http://localhost:${PORT}/api/health-check

📋 Available Endpoints:
  GET    /api/test           - Test API
  GET    /api/health-check   - Health check
  GET    /api/projects       - Get projects (needs DB)
  POST   /api/projects       - Add project (needs DB)
  GET    /api/clients        - Get clients (needs DB)
  POST   /api/clients        - Add client (needs DB)
  POST   /api/contact-form   - Submit contact form
  GET    /api/projects-mock  - Mock projects (no DB needed)
  GET    /api/clients-mock   - Mock clients (no DB needed)

💡 Database Status: ${mongoose.connection.readyState === 1 ? '✅ CONNECTED' : '❌ NOT CONNECTED'}
💡 Forms will work even without database (mock responses)
============================================ ✅
        `);
    });
};

startServer();