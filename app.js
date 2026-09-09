const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const session = require('express-session'); // נשתמש בזיכרון הדיפולטיבי של הסשן
const passport = require('passport');
const cron = require('node-cron');

const Message = require('./models/message');
require('./config/passport')(passport); 

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(express.static('public'));

const mongoURI = 'mongodb://127.0.0.1:27017/pitchConnect';
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// הגדרת סשן בסיסית ונקייה (ללא תלות בגרסאות מונגו)
app.use(session({
    secret: 'arbel_super_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.use(passport.initialize());
app.use(passport.session());

// חיבור הראוטים
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const courtRoutes = require('./routes/courtRoutes');
app.use('/api/courts', courtRoutes);

// משימה מתוזמנת: ניקוי צ'אטים כל לילה ב-03:00 שעון ישראל
cron.schedule('0 3 * * *', async () => {
    console.log('--- Starting scheduled chat cleanup ---');
    try {
        const result = await Message.deleteMany({});
        console.log(`Cleanup complete. Deleted ${result.deletedCount} old messages.`);
    } catch (error) {
        console.error('Error during scheduled cleanup:', error);
    }
}, {
    scheduled: true,
    timezone: "Asia/Jerusalem"
});

io.on('connection', (socket) => {
    socket.on('join_court_room', async (courtId) => {
        socket.join(courtId);
        try {
            const history = await Message.find({ courtId }).sort({ createdAt: 1 }).limit(50);
            socket.emit('chat_history', history);
        } catch (error) {
            console.error('Error fetching chat history:', error);
        }
        
        socket.to(courtId).emit('receive_message', {
            sender: 'מערכת',
            text: 'משתמש חדש הצטרף לצ\'אט!',
            time: new Date().toLocaleTimeString()
        });
    });

    socket.on('leave_court_room', (courtId) => {
        socket.leave(courtId);
    });

    socket.on('send_message', async (data) => {
        try {
            const newMsg = new Message({
                courtId: data.courtId,
                sender: data.sender,
                text: data.text,
                time: data.time
            });
            await newMsg.save();
        } catch (error) {
            console.error('Error saving message:', error);
        }
        socket.to(data.courtId).emit('receive_message', data);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});