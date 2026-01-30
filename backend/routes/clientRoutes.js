const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});


const fileFilter = (req, file, cb) => {
    
    const fileExt = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg'];
    
    
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml'];
    
    if (allowedExtensions.includes(fileExt) && allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (jpg, jpeg, png, gif, svg) are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 15* 1024 * 1024 },
    fileFilter: fileFilter
});


const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
       
        return res.status(400).json({ error: `File upload error: ${err.message}` });
    } else if (err) {
        
        return res.status(400).json({ error: err.message });
    }
    next();
};


router.get('/', async (req, res) => {
    try {
        const clients = await Client.find().sort({ createdAt: -1 });
        res.json(clients);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post('/', upload.single('image'), handleMulterError, async (req, res) => {
    try {
        const { name, description, designation } = req.body;
        
        
        if (!req.file) {
            return res.status(400).json({ error: 'Image file is required' });
        }

        const client = new Client({
            name,
            description,
            designation,
            image: req.file.filename
        });

        const savedClient = await client.save();
        res.status(201).json(savedClient);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


router.delete('/:id', async (req, res) => {
    try {
        const client = await Client.findByIdAndDelete(req.params.id);
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        res.json({ message: 'Client deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;