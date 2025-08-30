// index.js
// This is the main entry point of our application. It's responsible for
// loading the configuration, connecting to the different services,
// and handling the incoming messages in a unified way.

import dotenv from 'dotenv';

// Import the settings from our new config file
import { settings } from './config.js';

import { connectTwitch } from './twitch.js';
import { connectYouTube } from './youtube.js';
import { connectTikTok } from './tiktok.js';

// Load environment variables from the .env file
dotenv.config();

/**
 * A centralized handler for all incoming messages from all platforms.
 * @param {string} platform - The name of the platform (e.g., 'Twitch', 'YouTube').
 * @param {string} user - The username of the person who sent the message.
 * @param {string} message - The content of the message.
 * @param {boolean} [isAction=false] - Optional: Whether the message is an "action" (e.g., /me).
 */
function onMessageHandler(platform, user, message, isAction = false) {
  const time = new Date().toLocaleTimeString();
  if (isAction) {
    console.log(`[${time}] [${platform}] * ${user} ${message}`);
  } else {
    console.log(`[${time}] [${platform}] ${user}: ${message}`);
  }
}

// --- Main Application ---
console.log('--- Multi-Stream Chat Aggregator Starting ---');

// --- Connect to Services based on config ---

// Connect to Twitch only if it's enabled in config.js
if (settings.enableTwitch) {
  if (process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET && process.env.TWITCH_CHANNEL) {
    connectTwitch(
      process.env.TWITCH_CLIENT_ID,
      process.env.TWITCH_CLIENT_SECRET,
      process.env.TWITCH_CHANNEL,
      onMessageHandler
    );
  } else {
    console.warn('[TWITCH] Missing configuration in .env file. Skipping connection.');
  }
}

// Connect to YouTube only if it's enabled in config.js
if (settings.enableYouTube) {
  // Check for the new API Key
  if (process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_CHANNEL_ID) {
    connectYouTube(
      process.env.YOUTUBE_API_KEY,
      process.env.YOUTUBE_CHANNEL_ID,
      onMessageHandler
    );
  } else {
    console.warn('[YOUTUBE] Missing YOUTUBE_API_KEY or YOUTUBE_CHANNEL_ID in .env file. Skipping connection.');
  }
}

// Connect to TikTok only if it's enabled in config.js
if (settings.enableTikTok) {
  if (process.env.TIKTOK_USERNAME) {
    connectTikTok(process.env.TIKTOK_USERNAME, onMessageHandler);
  } else {
    console.warn('[TIKTOK] Missing TIKTOK_USERNAME in .env file. Skipping connection.');
  }
}

