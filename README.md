# **Infinity MD Session Generator**

[![Generate Pair Code](https://img.shields.io/badge/Generate%20Pair%20Code-Click%20Here-brightgreen?style=for-the-badge)](https://infinity-md-paircode.onrender.com)

---

## 🚀 How to Embed with Your Bot

### Method 1: Deploy as Standalone Service (Recommended)

**1. Deploy to Render.com:**
```bash
# Connect your GitHub repo to Render
# Set environment variables:
# PORT=8000
# NODE_ENV=production
```

**2. In your bot code, add a command:**
```javascript
// Example for Baileys bot
case 'pair':
case 'link':
    await conn.sendMessage(m.chat, {
        text: `🔗 *Infinity MD Session Generator*\n\n📱 Link your WhatsApp:\n🌐 ${process.env.PAIR_URL || 'https://your-render-url.onrender.com'}\n\n📋 Instructions:\n1. Click the link above\n2. Enter your phone number\n3. Generate pair code\n4. Enter the code in WhatsApp\n5. Your session file will be sent to you`
    });
    break;
```

### Method 2: Integrate API Calls

**1. Deploy the session generator**

**2. Create API wrapper in your bot:**
```javascript
// api.js
import axios from 'axios';

export const generatePairCode = async (phoneNumber) => {
    try {
        const response = await axios.get(`${process.env.SESSION_API_URL}/pair?number=${phoneNumber}`);
        return response.data.code;
    } catch (error) {
        console.error('Error generating pair code:', error);
        return null;
    }
};
```

**3. Use in bot commands:**
```javascript
case 'pair':
    if (!text) return m.reply('Please provide your phone number\nExample: .pair 1234567890');
    const code = await generatePairCode(text);
    if (code) {
        await conn.sendMessage(m.chat, {
            text: `🔐 *Your Pair Code:*\n\n📱 Code: \`${code}\`\n\n📋 Instructions:\n1. Open WhatsApp\n2. Go to Settings > Linked Devices\n3. Tap "Link a Device"\n4. Enter the code above\n\n⚠️ Code expires in 60 seconds!`
        });
    } else {
        m.reply('❌ Failed to generate pair code. Please try again.');
    }
    break;
```

### Method 3: Direct Integration (Advanced)

**1. Copy session generation logic to your bot:**
```javascript
// Add to your bot's main file
import { makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, Browsers } from '@whiskeysockets/baileys';

export const generateSession = async (phoneNumber) => {
    const sessionDir = `./sessions/${phoneNumber}`;
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    const sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
        },
        printQRInTerminal: true,
        browser: Browsers.windows('Chrome'),
    });

    return new Promise((resolve, reject) => {
        sock.ev.on('connection.update', async (update) => {
            const { connection, qr } = update;

            if (qr) {
                resolve({ type: 'qr', data: qr });
            }

            if (connection === 'open') {
                // Session created successfully
                resolve({ type: 'success', session: sessionDir });
            }
        });

        // Request pairing code for new login
        if (!sock.authState.creds.registered) {
            setTimeout(async () => {
                try {
                    const code = await sock.requestPairingCode(phoneNumber);
                    resolve({ type: 'pair', data: code });
                } catch (error) {
                    reject(error);
                }
            }, 3000);
        }
    });
};
```

**2. Use in commands:**
```javascript
case 'session':
case 'link':
    if (!text) return m.reply('Please provide your phone number\nExample: .session 1234567890');

    try {
        const result = await generateSession(text);

        if (result.type === 'pair') {
            await conn.sendMessage(m.chat, {
                text: `🔐 *Pair Code Generated*\n\n📱 Code: \`${code}\`\n\n⚠️ Enter this code in WhatsApp within 60 seconds!`
            });
        } else if (result.type === 'qr') {
            // Send QR code image
            const qrImage = await QRCode.toDataURL(result.data);
            await conn.sendMessage(m.chat, {
                image: { url: qrImage },
                caption: '📱 Scan this QR code with WhatsApp'
            });
        }
    } catch (error) {
        m.reply('❌ Failed to generate session. Please try again.');
    }
    break;
```

---

### Quick Start

- **1) Create a Mega.nz account**
  [![MEGA - Create Account](https://img.shields.io/badge/MEGA-Create%20Account-red?logo=mega&logoColor=white)](https://mega.nz)

- **2) Update credentials in `mega.js`**
  ```js
  const auth = {
      email: 'thanudiakeesha@gmail.com',
      password: 'Savin123',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246'
  };
  ```

- **3) Deploy to Render**
  [![Render - Deploy](https://img.shields.io/badge/Render-Deploy%20Web%20Service-46E3B7?logo=render&logoColor=white)](https://render.com)

---

## 📋 Environment Variables

```bash
PORT=8000
NODE_ENV=production
PAIR_URL=https://your-app.onrender.com
```

## 🔧 Dependencies Required

```json
{
  "@whiskeysockets/baileys": "^6.7.21",
  "express": "^4.21.2",
  "qrcode": "^1.5.4",
  "awesome-phonenumber": "7.2.0",
  "megajs": "^1.1.0"
}
```

---

## 🎯 Usage Examples

**Web Interface:**
- Visit `https://your-domain.com`
- Enter phone number
- Generate pair code or scan QR
- Session file sent automatically

**Bot Integration:**
- `.pair 1234567890` - Generate pair code
- `.link 1234567890` - Alternative command
- `.session 1234567890` - Direct session generation

---

## ⚠️ Security Notes

- Never share session files (`creds.json`)
- Use HTTPS in production
- Implement rate limiting
- Clean up old sessions regularly
- Validate phone numbers properly

---

## 📞 Support

For issues or questions:
- GitHub: [@infinitymd](https://github.com/infinitymd)
- YouTube: [@infinity_md](https://youtube.com/@infinity_md)
  