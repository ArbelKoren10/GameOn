require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const cron = require('node-cron');
const { GoogleGenAI } = require('@google/genai');

const Message = require('./models/message');
const Event = require('./models/event');
require('./config/passport')(passport);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// אתחול לקוח ה-AI (משתמש במפתח מהסביבה)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pitchConnect';
mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use(session({
    secret: 'arbel_super_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/courts', require('./routes/courtRoutes'));
app.use('/api/activity', require('./routes/activityRoutes'));

cron.schedule('0 3 * * *', async () => {
    console.log('--- Starting scheduled cleanup (03:00 AM) ---');
    try {
        const chatResult = await Message.deleteMany({});
        console.log(`Deleted ${chatResult.deletedCount} chat messages.`);

        const now = new Date();
        const eventResult = await Event.deleteMany({ eventDate: { $lt: now } });
        console.log(`Deleted ${eventResult.deletedCount} expired events.`);

    } catch (error) {
        console.error('Error during scheduled cleanup:', error);
    }
}, {
    scheduled: true,
    timezone: "Asia/Jerusalem"
});

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    const broadcastRoomUserCount = (room) => {
        if (!room) return;
        const roomObj = io.sockets.adapter.rooms.get(room);
        const userCount = roomObj ? roomObj.size : 0;
        io.emit('court_status_update', { courtId: room, count: userCount });
    };

    socket.on('join_court_room', async (courtId) => {
        if (socket.currentRoom && socket.currentRoom !== courtId) {
            const previousRoom = socket.currentRoom;
            socket.leave(previousRoom);
            setTimeout(() => broadcastRoomUserCount(previousRoom), 100);
        }

        socket.join(courtId);
        socket.currentRoom = courtId;

        setTimeout(() => broadcastRoomUserCount(courtId), 100);

        try {
            const history = await Message.find({ courtId }).sort({ createdAt: 1 }).limit(50);
            socket.emit('chat_history', history);
        } catch (error) { console.error('Error fetching chat history:', error); }

        socket.to(courtId).emit('receive_message', {
            sender: 'מערכת',
            text: 'משתמש חדש הצטרף לצ\'אט!',
            time: new Date().toLocaleTimeString('he-IL')
        });
    });

    socket.on('leave_court_room', (courtId) => {
        socket.leave(courtId);
        if (socket.currentRoom === courtId) {
            socket.currentRoom = null;
        }
        setTimeout(() => broadcastRoomUserCount(courtId), 100);
    });

    // ==============================================
    // סנכרון לו"ז בזמן אמת בין כל המשתמשים
    // ==============================================
    socket.on('reservation_update', (data) => {
        // משדר לכל שאר המשתמשים שנמצאים כרגע באותו חדר (מגרש) לרענן את הלו"ז שלהם
        socket.to(data.courtId).emit('refresh_reservations', data);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        if (socket.currentRoom) {
            const roomToUpdate = socket.currentRoom;
            setTimeout(() => broadcastRoomUserCount(roomToUpdate), 100);
        }
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
        } catch (error) { console.error('Error saving message:', error); }

        socket.to(data.courtId).emit('receive_message', data);

        if (data.text.trim().startsWith('@GameOn')) {
            const userQuestion = data.text.replace('@GameOn', '').trim();

            if (userQuestion.length > 0) {
                try {
                    const now = new Date();
                    const currentDateTime = now.toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' });

                    const prompt = `אתה GameOn AI, עוזר חכם באפליקציה למציאת מגרשי ספורט בישראל. 
המידע המעודכן ביותר עבורך: התאריך והשעה הנוכחיים עכשיו הם ${currentDateTime}. 
אל תמציא מידע, ואם אתה לא יודע תוצאות של משחקים שהתרחשו לאחרונה, פשוט תגיד שאין לך גישה לתוצאות חיות.
שחקן במגרש שואל אותך: "${userQuestion}". 
ענה לו בעברית קצרה, קלילה, לעניין (עד 3-4 משפטים) והוסף אימוג'י אחד או שניים.`;

                    const response = await ai.models.generateContent({
                        model: 'gemini-3.6-flash',
                        contents: prompt,
                    });

                    const aiMessageData = {
                        courtId: data.courtId,
                        sender: 'GameOn AI 🤖',
                        text: response.text,
                        time: new Date().toLocaleTimeString('he-IL')
                    };

                    const aiMsgRecord = new Message({
                        courtId: aiMessageData.courtId,
                        sender: aiMessageData.sender,
                        text: aiMessageData.text,
                        time: aiMessageData.time
                    });
                    await aiMsgRecord.save();

                    io.in(data.courtId).emit('receive_message', aiMessageData);

                } catch (aiError) {
                    console.error('Error generating AI response:', aiError);
                    const errorMsg = {
                        courtId: data.courtId,
                        sender: 'GameOn AI 🤖',
                        text: 'מצטער, אני בחימום עכשיו וקשה לי לחשוב. נסה שוב עוד רגע!',
                        time: new Date().toLocaleTimeString('he-IL')
                    };
                    io.in(data.courtId).emit('receive_message', errorMsg);
                }
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});