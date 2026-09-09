const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    courtId: { type: String, required: true },
    creator: { type: String, required: true }, // שם המשתמש שפתח את האירוע
    title: { type: String, required: true },
    eventType: { type: String, enum: ['משחק אימון', 'טורניר', 'יום הולדת', 'אחר'], default: 'משחק אימון' },
    description: String,
    eventDate: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);