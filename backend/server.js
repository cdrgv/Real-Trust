const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

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

// Middleware - Fix CORS to allow all origins for development
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Increased limit for Base64 images
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection
const connectDB = async () => {
    try {
        console.log('🔗 Connecting to MongoDB...');
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://fullstack:fullstack2006@cluster0.jc9cbnh.mongodb.net/');
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        return null;
    }
};

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/subscribers', subscriberRoutes);

// Contact form submission
app.post('/api/contact-form', async (req, res) => {
    try {
        const { name, email, mobile, city } = req.body;

        // Validation
        if (!name || !email || !mobile || !city) {
            return res.status(400).json({ 
                error: 'All fields are required'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Please enter a valid email address' });
        }

        // Mobile validation
        const mobileRegex = /^[0-9]{10}$/;
        const cleanMobile = mobile.replace(/\D/g, '');
        if (!mobileRegex.test(cleanMobile)) {
            return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number' });
        }

        // Check if MongoDB is connected
        if (mongoose.connection.readyState !== 1) {
            return res.status(201).json({ 
                success: true,
                message: 'Contact form submitted successfully! (Database not connected)',
                data: {
                    id: 'mock_' + Date.now(),
                    name: name,
                    email: email,
                    submittedAt: new Date().toISOString()
                }
            });
        }

        // Check if contact already exists
        const existingContact = await Contact.findOne({ email });
        if (existingContact) {
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
        console.error('Error submitting contact form:', error);
        res.status(500).json({ 
            error: 'Failed to submit contact form',
            details: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health-check', (req, res) => {
    const mongodbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.status(200).json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        mongodb: mongodbStatus,
        imageStorage: 'MongoDB (Base64)'
    });
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Red Trust API is working',
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        imageStorage: 'MongoDB (Base64)'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'Red Trust API is running',
        version: '1.0.0',
        status: 'OK',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err.message);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: err.message
    });
});

// Handle 404 routes
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Endpoint not found',
        requested: `${req.method} ${req.url}`
    });
});

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
    console.log('🚀 Starting Red Trust API Server...');
    
    await connectDB();
    
    app.listen(PORT, () => {
        console.log(`
✅ Server is running on port ${PORT}
🔗 API Base URL: http://localhost:${PORT}
💾 Database Status: ${mongoose.connection.readyState === 1 ? '✅ CONNECTED' : '❌ NOT CONNECTED'}
💾 Image Storage: MongoDB (Base64)
        `);
    });
};

startServer();