// Infinity MD Bot Integration Example
// Add this to your main bot file

import axios from 'axios';

// Configuration
const SESSION_API_URL = process.env.SESSION_API_URL || 'https://your-session-generator.onrender.com';

// Function to generate pair code via API
export const generatePairCode = async (phoneNumber) => {
    try {
        const response = await axios.get(`${SESSION_API_URL}/pair?number=${phoneNumber}`, {
            timeout: 30000
        });
        return response.data.code;
    } catch (error) {
        console.error('Error generating pair code:', error.message);
        return null;
    }
};

// Function to generate QR code via API
export const generateQRCode = async () => {
    try {
        const response = await axios.get(`${SESSION_API_URL}/qr`, {
            timeout: 60000
        });
        return response.data;
    } catch (error) {
        console.error('Error generating QR code:', error.message);
        return null;
    }
};

// Function to load session by ID
export const loadSessionById = async (sessionId) => {
    try {
        const response = await axios.get(`${SESSION_API_URL}/session/${sessionId}`, {
            timeout: 30000
        });
        return response.data; // This will be the creds.json content
    } catch (error) {
        console.error('Error loading session:', error.message);
        return null;
    }
};

// Bot command handlers
export const handlePairCommand = async (conn, m, text) => {
    if (!text) {
        return await conn.sendMessage(m.chat, {
            text: `❌ *Phone number required!*\n\n📝 Usage: .pair 1234567890\n\n📱 Include country code without +`
        });
    }

    // Clean phone number
    const phoneNumber = text.replace(/[^0-9]/g, '');

    if (phoneNumber.length < 10 || phoneNumber.length > 15) {
        return await conn.sendMessage(m.chat, {
            text: `❌ *Invalid phone number!*\n\n📱 Please enter a valid international number\n\n📝 Example: .pair 94712345678`
        });
    }

    // Show loading message
    const loadingMsg = await conn.sendMessage(m.chat, {
        text: `⏳ *Generating pair code for ${phoneNumber}...*\n\n📱 Please wait...`
    });

    try {
        const code = await generatePairCode(phoneNumber);

        if (code) {
            // Delete loading message
            await conn.sendMessage(m.chat, { delete: loadingMsg.key });

            await conn.sendMessage(m.chat, {
                text: `✅ *Infinity MD - Pair Code Generated!*\n\n🔐 *Code:* \`${code}\`\n\n📋 *Instructions:*\n1. 📱 Open WhatsApp on your phone\n2. ⚙️ Go to *Settings > Linked Devices*\n3. 🔗 Tap *Link a Device*\n4. 📝 Enter the code above\n\n⚠️ *Code expires in 60 seconds!*\n\n🎉 Your Session ID will be sent automatically once connected!`
            });
        } else {
            await conn.sendMessage(m.chat, { delete: loadingMsg.key });
            await conn.sendMessage(m.chat, {
                text: `❌ *Failed to generate pair code*\n\n🔄 Please try again later or contact support\n\n📞 Support: @infinity_md`
            });
        }
    } catch (error) {
        await conn.sendMessage(m.chat, { delete: loadingMsg.key });
        await conn.sendMessage(m.chat, {
            text: `❌ *Error occurred*\n\n🔄 Please try again\n\n📞 Support: @infinity_md`
        });
    }
};

export const handleQRCommand = async (conn, m) => {
    // Show loading message
    const loadingMsg = await conn.sendMessage(m.chat, {
        text: `⏳ *Generating QR Code...*\n\n📱 Please wait...`
    });

    try {
        const qrData = await generateQRCode();

        if (qrData && qrData.qr) {
            // Delete loading message
            await conn.sendMessage(m.chat, { delete: loadingMsg.key });

            await conn.sendMessage(m.chat, {
                image: { url: qrData.qr },
                caption: `✅ *Infinity MD - QR Code Generated!*\n\n📋 *Instructions:*\n${qrData.instructions.join('\n')}\n\n⚠️ *QR code expires in 60 seconds!*\n\n🎉 Your Session ID will be sent automatically once scanned!`
            });
        } else {
            await conn.sendMessage(m.chat, { delete: loadingMsg.key });
            await conn.sendMessage(m.chat, {
                text: `❌ *Failed to generate QR code*\n\n🔄 Please try again later\n\n📞 Support: @infinity_md`
            });
        }
    } catch (error) {
        await conn.sendMessage(m.chat, { delete: loadingMsg.key });
        await conn.sendMessage(m.chat, {
            text: `❌ *Error occurred*\n\n🔄 Please try again\n\n📞 Support: @infinity_md`
        });
    }
};

export const handleLinkCommand = async (conn, m) => {
    await conn.sendMessage(m.chat, {
        text: `🔗 *Infinity MD Session Generator*\n\n🌐 *Web Interface:* ${SESSION_API_URL}\n\n📱 *Commands Available:*\n• \`.pair <number>\` - Generate pair code\n• \`.qr\` - Generate QR code\n• \`.loadsession <id>\` - Load session by ID\n• \`.link\` - Show this menu\n\n📋 *How to use:*\n1. Use .pair or .qr to get your Session ID\n2. Save the Session ID sent to your WhatsApp\n3. Use .loadsession <id> in your bot to load it\n\n⚠️ *Important:*\n• Keep your Session ID safe\n• Never share it with anyone\n• Example: .loadsession session_1771469960142abc123\n\n📞 *Support:* @infinity_md`
    });
};

// Example usage in your bot's command handler
/*
switch (command) {
    case 'pair':
        await handlePairCommand(conn, m, text);
        break;

    case 'qr':
        await handleQRCommand(conn, m);
        break;

    case 'link':
    case 'session':
        await handleLinkCommand(conn, m);
        break;

    case 'loadsession':
        // Usage: .loadsession session_1771469960142abc123
        if (!text) {
            return await conn.sendMessage(m.chat, { text: 'Please provide a session ID' });
        }
        const creds = await loadSessionById(text);
        if (creds) {
            // Save creds to a file or use directly
            // For example, write to ./session/creds.json
            const fs = await import('fs');
            fs.writeFileSync('./session/creds.json', JSON.stringify(creds, null, 2));
            await conn.sendMessage(m.chat, { text: 'Session loaded successfully! Restart your bot to use it.' });
        } else {
            await conn.sendMessage(m.chat, { text: 'Failed to load session. Check the ID.' });
        }
        break;
}
*/