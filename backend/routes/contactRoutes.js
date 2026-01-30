const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');


router.post('/', async (req, res) => {
    try {
        const { fullName, email, mobileNumber, city } = req.body;

        
        if (!fullName || !email || !mobileNumber || !city) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const contact = new Contact({
            fullName,
            email,
            mobileNumber,
            city
        });

        const savedContact = await contact.save();
        res.status(201).json(savedContact);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


router.get('/', async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ submittedAt: -1 });
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);
        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;