import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const __dirname = path.resolve();

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

app.get('/config.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'config.html'));
});

app.post('/api/save-config', async (req, res) => {
    const config = req.body;
        // Save .env
        let envContent = 
            `TWITCH_CLIENT_ID="${config.TWITCH_CLIENT_ID}"\n` +
            `TWITCH_CLIENT_SECRET="${config.TWITCH_CLIENT_SECRET}"\n` +
            `TWITCH_CHANNEL="${config.TWITCH_CHANNEL}"\n` +
            `YOUTUBE_API_KEY="${config.YOUTUBE_API_KEY}"\n` +
            `YOUTUBE_CHANNEL_ID="${config.YOUTUBE_CHANNEL_ID}"\n` +
            `TIKTOK_USERNAME="${config.TIKTOK_USERNAME}"\n`;
        await fs.writeFile(path.resolve(process.cwd(), '.env'), envContent, 'utf-8');
        // Save config.js
        let jsContent = 
            `export const settings = {\n` +
            `  enableTwitch: ${config.enableTwitch},\n` +
            `  enableYouTube: ${config.enableYouTube},\n` +
            `  enableTikTok: ${config.enableTikTok}\n` +
            `};\n`;
        await fs.writeFile(path.resolve(process.cwd(), 'config.js'), jsContent, 'utf-8');
    res.sendStatus(200);
});

app.listen(3000, () => console.log('Config server running on http://localhost:3000'));