const express = require('express');
const router = express.Router();
const Client = require('../models/Client');

// Get all clients
router.get('/', async (req, res) => {
    try {
        const clients = await Client.find().sort({ createdAt: -1 });
        
        const clientsWithImages = clients.map(client => {
            const clientObj = client.toObject();
            
            if (client.image) {
                clientObj.imageUrl = `data:${client.imageType};base64,${client.image}`;
            } else {
                clientObj.imageUrl = null;
            }
            
            return clientObj;
        });
        
        res.json(clientsWithImages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new client
router.post('/', async (req, res) => {
    try {
        const { name, description, designation, imageBase64, imageType } = req.body;
        
        console.log('Creating client:', { 
            name, 
            designation,
            descriptionLength: description?.length,
            imageSize: imageBase64?.length,
            imageType 
        });
        
        if (!name || !description || !designation) {
            return res.status(400).json({ error: 'Name, description, and designation are required' });
        }

        const clientData = {
            name,
            description,
            designation
        };

        // If image is provided as Base64
        if (imageBase64 && imageBase64.trim() !== '') {
            clientData.image = imageBase64;
            clientData.imageType = imageType || 'image/jpeg';
        }

        const client = new Client(clientData);
        const savedClient = await client.save();
        
        // Return with image URL
        const response = savedClient.toObject();
        if (savedClient.image) {
            response.imageUrl = `data:${savedClient.imageType};base64,${savedClient.image}`;
        }
        
        console.log('Client saved:', savedClient._id);
        res.status(201).json(response);
    } catch (error) {
        console.error('Error creating client:', error);
        res.status(400).json({ error: error.message });
    }
});

// Delete client
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