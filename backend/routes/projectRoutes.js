const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// Get all projects
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        
        // Convert Base64 to data URLs for frontend
        const projectsWithImages = projects.map(project => {
            const projectObj = project.toObject();
            
            if (project.image) {
                // Create data URL from Base64
                projectObj.imageUrl = `data:${project.imageType};base64,${project.image}`;
            } else {
                projectObj.imageUrl = null;
            }
            
            return projectObj;
        });
        
        res.json(projectsWithImages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new project
router.post('/', async (req, res) => {
    try {
        const { name, description, imageBase64, imageType } = req.body;
        
        console.log('Creating project:', { 
            name, 
            descriptionLength: description?.length,
            imageSize: imageBase64?.length,
            imageType 
        });
        
        if (!name || !description) {
            return res.status(400).json({ error: 'Name and description are required' });
        }

        const projectData = {
            name,
            description
        };

        // If image is provided as Base64
        if (imageBase64 && imageBase64.trim() !== '') {
            projectData.image = imageBase64;
            projectData.imageType = imageType || 'image/jpeg';
        }

        const project = new Project(projectData);
        const savedProject = await project.save();
        
        // Return with image URL
        const response = savedProject.toObject();
        if (savedProject.image) {
            response.imageUrl = `data:${savedProject.imageType};base64,${savedProject.image}`;
        }
        
        console.log('Project saved:', savedProject._id);
        res.status(201).json(response);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(400).json({ error: error.message });
    }
});

// Delete project
router.delete('/:id', async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;