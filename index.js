import express from 'express';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Importing the modules
import pairRouter from './pair.js';
import qrRouter from './qr.js';
import QRCode from 'qrcode';

const app = express();

// Resolve the current directory path in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8000;

import('events').then(events => {
    events.EventEmitter.defaultMaxListeners = 500;
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pair.html'));
});

app.use('/pair', pairRouter);
app.use('/qr', qrRouter);

// Route to get session by ID
app.get('/session/:id', (req, res) => {
    const sessionId = req.params.id;
    const sessionPath = path.join(__dirname, 'qr_sessions', sessionId, 'creds.json');
    
    // Check if session exists
    if (!fs.existsSync(sessionPath)) {
        return res.status(404).json({ error: 'Session not found' });
    }
    
    // Send the creds.json file
    res.sendFile(sessionPath);
});

app.listen(PORT, () => {
    console.log(`YoutTube: @infinity_md\n\nGitHub: @infinitymd\n\nServer running on http://localhost:${PORT}`);
});

export default app;
