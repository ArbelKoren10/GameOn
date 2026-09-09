const Court = require('../models/court');

// Create - יצירת מגרש חדש
exports.createCourt = async (req, res) => {
    try {
        const { name, city, sportType, hasLighting, location } = req.body;
        const newCourt = new Court({ name, city, sportType, hasLighting, location });
        const savedCourt = await newCourt.save();
        res.status(201).json(savedCourt);
    } catch (error) {
        res.status(500).json({ message: 'Error creating court', error: error.message });
    }
};

// List - שליפת כל המגרשים
exports.getAllCourts = async (req, res) => {
    try {
        const courts = await Court.find();
        res.status(200).json(courts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching courts', error: error.message });
    }
};

// Update - עדכון מגרש
exports.updateCourt = async (req, res) => {
    try {
        const updatedCourt = await Court.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedCourt) return res.status(404).json({ message: 'Court not found' });
        res.status(200).json(updatedCourt);
    } catch (error) {
        res.status(500).json({ message: 'Error updating court', error: error.message });
    }
};

// Delete - מחיקת מגרש
exports.deleteCourt = async (req, res) => {
    try {
        const deletedCourt = await Court.findByIdAndDelete(req.params.id);
        if (!deletedCourt) return res.status(404).json({ message: 'Court not found' });
        res.status(200).json({ message: 'Court deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting court', error: error.message });
    }
};

// Search - חיפוש מתקדם (3 פרמטרים כנדרש)
exports.searchCourts = async (req, res) => {
    try {
        const { city, sportType, hasLighting } = req.query;
        let searchQuery = {};
        
        if (city) searchQuery.city = city;
        if (sportType) searchQuery.sportType = sportType;
        if (hasLighting) searchQuery.hasLighting = hasLighting === 'true';

        const courts = await Court.find(searchQuery);
        res.status(200).json(courts);
    } catch (error) {
        res.status(500).json({ message: 'Error searching courts', error: error.message });
    }
};