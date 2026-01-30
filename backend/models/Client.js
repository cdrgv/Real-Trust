const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String, // Store as Base64 string
        default: ''
    },
    imageType: {
        type: String, // Store MIME type
        default: 'image/jpeg'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Client', clientSchema);