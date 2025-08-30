// tiktok.js
// This file handles the connection to TikTok LIVE using the library you found.

import { WebcastPushConnection } from 'tiktok-live-connector';

export function connectTikTok(username, onMessage) {
  try {
    // Create a new connection instance
    const tiktokLiveConnection = new WebcastPushConnection(username);

    // Connect to the webcast
    tiktokLiveConnection.connect().then(state => {
      console.log(`[TIKTOK] Successfully connected to @${username}`);
    }).catch(err => {
      console.error(`[TIKTOK] Failed to connect to @${username}:`, err);
    });

    // --- Chat Event ---
    tiktokLiveConnection.on('chat', data => {
      onMessage('TikTok', data.uniqueId, data.comment);
    });

    // --- Gift Event ---
    tiktokLiveConnection.on('gift', data => {
        if (data.giftType === 1 && !data.repeatEnd) {
            // Streakable gift
            onMessage('TikTok', '[SYSTEM]', `${data.uniqueId} is sending ${data.giftName} x${data.repeatCount}!`);
        } else if (data.giftType !== 1) {
            // Non-streakable gift
            onMessage('TikTok', '[SYSTEM]', `${data.uniqueId} sent ${data.giftName}!`);
        }
    });

    // --- Like Event ---
    tiktokLiveConnection.on('like', data => {
        onMessage('TikTok', '[SYSTEM]', `${data.uniqueId} sent ${data.likeCount} likes!`);
    });

    // --- Follow Event ---
    tiktokLiveConnection.on('follow', data => {
        onMessage('TikTok', '[SYSTEM]', `${data.uniqueId} just followed!`);
    });

    // --- Share Event ---
    tiktokLiveConnection.on('share', (data) => {
        onMessage('TikTok', '[SYSTEM]', `${data.uniqueId} just shared the stream!`);
    }); // <-- THE FIX: Added a closing parenthesis here.

  } catch (error) {
    console.error('[TIKTOK] Failed to initialize:', error.message);
  }
}

