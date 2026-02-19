// Example: How to integrate Infinity MD Session Generator into your existing Baileys bot
// This shows how to add session generation commands to your bot

import {
    default as makeWASocket,
    DisconnectReason,
    useMultiFileAuthState,
    makeCacheableSignalKeyStore,
    Browsers
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import our session generator functions
import { generatePairCode, generateQRCode, handlePairCommand, handleQRCommand, handleLinkCommand } from './bot-integration.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Your existing bot configuration
const SESSION_API_URL = process.env.SESSION_API_URL || 'https://your-session-generator.onrender.com';

// Main bot function (modify your existing bot code)
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');

    const conn = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" }))
        },
        printQRInTerminal: true,
        logger: pino({ level: 'silent' }),
        browser: Browsers.macOS('Desktop'),
    });

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error instanceof Boom)
                ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
                : true;

            if (shouldReconnect) {
                console.log('Reconnecting...');
                startBot();
            }
        } else if (connection === 'open') {
            console.log('Bot connected successfully!');
        }
    });

    conn.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message) return;

        const messageType = Object.keys(m.message)[0];
        const text = m.message.conversation || m.message.extendedTextMessage?.text || '';
        const command = text.split(' ')[0].toLowerCase().replace(/^[.,]/, '');
        const args = text.split(' ').slice(1).join(' ');

        // Your existing commands here...

        // Add these new commands for session generation
        switch (command) {
            case 'pair':
                await handlePairCommand(conn, m, args);
                break;

            case 'qr':
            case 'qrcode':
                await handleQRCommand(conn, m);
                break;

            case 'link':
            case 'session':
            case 'connect':
                await handleLinkCommand(conn, m);
                break;

            // Your other commands...
        }
    });

    return conn;
}

// Alternative: If you want to use direct integration instead of API calls
// Uncomment this section and comment out the API-based commands above

/*
export const generateSessionDirectly = async (phoneNumber) => {
    const sessionDir = `./temp_sessions/${phoneNumber}_${Date.now()}`;
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    const sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" }))
        },
        printQRInTerminal: false,
        logger: pino({ level: "fatal" }),
        browser: Browsers.windows('Chrome'),
    });

    return new Promise((resolve, reject) => {
        sock.ev.on('connection.update', async (update) => {
            const { connection, qr } = update;

            if (qr) {
                resolve({ type: 'qr', data: qr, socket: sock });
            }

            if (connection === 'open') {
                resolve({ type: 'success', session: sessionDir, socket: sock });
            }
        });

        sock.ev.on('creds.update', saveCreds);

        // Request pairing code
        if (!sock.authState.creds.registered) {
            setTimeout(async () => {
                try {
                    const code = await sock.requestPairingCode(phoneNumber);
                    resolve({ type: 'pair', data: code, socket: sock });
                } catch (error) {
                    reject(error);
                }
            }, 3000);
        }
    });
};

// Direct integration command handler
export const handleDirectPairCommand = async (conn, m, phoneNumber) => {
    if (!phoneNumber) {
        return await conn.sendMessage(m.chat, {
            text: '❌ Please provide a phone number\n\n📝 Example: .pairdirect 1234567890'
        });
    }

    const loadingMsg = await conn.sendMessage(m.chat, {
        text: '⏳ Generating session directly...'
    });

    try {
        const result = await generateSessionDirectly(phoneNumber);

        if (result.type === 'pair') {
            await conn.sendMessage(m.chat, { delete: loadingMsg.key });
            await conn.sendMessage(m.chat, {
                text: `🔐 *Pair Code:* \`${result.data}\`\n\nEnter this in WhatsApp within 60 seconds!`
            });
        } else if (result.type === 'qr') {
            // Send QR code
            const QRCode = (await import('qrcode')).default;
            const qrImage = await QRCode.toDataURL(result.data);

            await conn.sendMessage(m.chat, { delete: loadingMsg.key });
            await conn.sendMessage(m.chat, {
                image: { url: qrImage },
                caption: '📱 Scan this QR code with WhatsApp'
            });
        }

        // Clean up
        setTimeout(() => {
            if (result.socket) {
                result.socket.end();
            }
            if (result.session && fs.existsSync(result.session)) {
                fs.rmSync(result.session, { recursive: true, force: true });
            }
        }, 30000);

    } catch (error) {
        await conn.sendMessage(m.chat, { delete: loadingMsg.key });
        await conn.sendMessage(m.chat, {
            text: '❌ Failed to generate session'
        });
    }
};
*/

// Start the bot
startBot().catch(console.error);

export default startBot;