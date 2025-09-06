import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import { connectTwitch } from './twitch.js';
import { connectYouTube } from './youtube.js';
import { connectTikTok } from './tiktok.js';
import { settings } from './config.js';

dotenv.config();
console.log('--- Multi-Stream Chat Aggregator Starting ---');

// --- WebSocket Server Setup ---
const wss = new WebSocketServer({ port: 8080 });
let connectedClients = new Set();

wss.on('connection', (ws) => {
    console.log('[SERVER] A new client has connected.');
    connectedClients.add(ws);
    
    ws.on('close', () => {
        console.log('[SERVER] A client has disconnected.');
        connectedClients.delete(ws);
    });
    
    ws.on('error', (error) => {
        console.error('[SERVER] WebSocket error:', error);
    });
});

console.log(`[SERVER] WebSocket server started on port 8080. Waiting for connections...`);


/**
 * The central message handler.
 * Instead of logging to the console, it now broadcasts messages to all connected web clients.
 * @param {string} platform - The platform the message is from (e.g., 'Twitch').
 * @param {string} user - The username of the chatter.
 * @param {string} message - The chat message content.
 */
function onMessageHandler(platform, user, message) {
    // Also log to the console for backend debugging
    console.log(`[${platform.toUpperCase()}] ${user}: ${message}`);

    const messageData = {
        platform,
        user,
        message,
        timestamp: new Date().toISOString()
    };

    const jsonData = JSON.stringify(messageData);

    // Broadcast the message to every connected client
    connectedClients.forEach(client => {
        if (client.readyState === 1) { // 1 means OPEN
            client.send(jsonData);
        }
    });
}

/**
 * Broadcasts a system message to all connected clients.
 * @param {string} message - The message content to broadcast.
 */
function broadcastSystemMessage(message) {
    const messageData = {
        platform: 'System',
        user: '[SYSTEM]',
        message,
        timestamp: new Date().toISOString()
    };
    const jsonData = JSON.stringify(messageData);
    connectedClients.forEach(client => {
        if (client.readyState === 1) {
            client.send(jsonData);
        }
    });
}

// --- Platform Connections ---
// Connect to each platform if it's enabled in the config.

if (settings.enableTwitch) {
    const { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, TWITCH_CHANNEL } = process.env;
    connectTwitch(TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, TWITCH_CHANNEL, onMessageHandler);
}

if (settings.enableYouTube) {
    const { YOUTUBE_CHANNEL_ID, YOUTUBE_API_KEY } = process.env;
    connectYouTube(YOUTUBE_API_KEY, YOUTUBE_CHANNEL_ID, onMessageHandler);
    console.log('Loaded YouTube API Key:', process.env.YOUTUBE_API_KEY);
}

if (settings.enableTikTok) {
    const { TIKTOK_USERNAME } = process.env;
    connectTikTok(TIKTOK_USERNAME, onMessageHandler);
}

// Example usage of broadcasting a system message
broadcastSystemMessage('Server started and ready for connections.');

