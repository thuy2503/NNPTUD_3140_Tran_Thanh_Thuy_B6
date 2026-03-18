require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./models/routes/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    const mongoUri = process.env.MONGODB_URI;

    try {
        if (mongoUri) {
            await mongoose.connect(mongoUri);
            console.log('✅ Connected to MongoDB');
        } else {
            throw new Error('No MONGODB_URI provided');
        }
    } catch (err) {
        console.warn('⚠️ MongoDB connection failed:', err.message);
        console.warn('⚠️ Falling back to in-memory MongoDB for local development.');

        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const inMemoryUri = mongod.getUri();

        await mongoose.connect(inMemoryUri, {
            dbName: 'authdb'
        });

        console.log('✅ Connected to in-memory MongoDB');
    }

    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
};

startServer();

// Health check
app.get('/', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'API is running',
        timestamp: new Date().toISOString()
    });
});

