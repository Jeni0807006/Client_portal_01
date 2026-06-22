const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, '../client')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/saved', require('./routes/saved'));

// Default Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/login.html'));
});

// Server Start
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});