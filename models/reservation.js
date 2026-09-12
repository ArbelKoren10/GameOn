const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    courtId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    date: {
        type: String, // שומרים כתאריך בפורמט YYYY-MM-DD
        required: true
    },
    startTime: {
        type: String, // למשל: "18:00"
        required: true
    },
    endTime: {
        type: String, // למשל: "19:00"
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Reservation', reservationSchema);