const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String, // Store as Base64 string
        default: ''
    },
    imageType: {
        type: String, // Store MIME type (e.g., 'image/jpeg')
        default: 'image/jpeg'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Project', projectSchema);