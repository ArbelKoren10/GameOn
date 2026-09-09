const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    courtId: { type: String, required: true },
    uploader: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, enum: ['image', 'video'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);