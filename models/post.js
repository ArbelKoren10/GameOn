const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // קישור למודל המשתמש שיצר את הפוסט
        required: true
    },
    court: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Court', // קישור למגרש הספציפי שבו הפוסט פורסם
        required: true
    },
    content: {
        type: String,
        required: true
    },
    missingPlayers: {
        type: Number,
        default: 0
    },
    matchDate: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);