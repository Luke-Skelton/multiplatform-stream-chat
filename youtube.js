// youtube.js
// Handles the connection to YouTube Live chat using the OFFICIAL YouTube Data API.
// This method is more reliable than scraping libraries.

import fetch from 'node-fetch';

let liveChatId = null;
let nextPageToken = null;
let chatPollingInterval = null;
let chatPollingTimeout = null;

/**
 * A helper function to find the active live stream for a given channel.
 * @param {string} apiKey - Your YouTube Data API key.
 * @param {string} channelId - The ID of the YouTube channel.
 * @returns {string|null} The ID of the active live chat, or null if not found.
 */
async function getLiveChatId(apiKey, channelId) {
    try {
        // Step 1: Find the active live broadcast Video ID.
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}`;
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        if (!searchData.items || searchData.items.length === 0) {
            console.log(`[YOUTUBE] No active live stream found for channel ${channelId}. Retrying...`);
            return null;
        }

        const liveBroadcast = searchData.items[0];
        const videoId = liveBroadcast.id?.videoId;
        if (!videoId) {
            console.error(`[YOUTUBE] Found a live broadcast but no videoId. Raw item:`, liveBroadcast);
            return null;
        }

        // Step 2: Use the Video ID to get the Live Chat ID.
        const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${videoId}&key=${apiKey}`;
        const videoResponse = await fetch(videoUrl);
        const videoData = await videoResponse.json();

        if (!videoData.items || videoData.items.length === 0) {
            console.error(`[YOUTUBE] Video response missing items. Raw response:`, videoData);
            return null;
        }

        const liveChatId = videoData.items[0]?.liveStreamingDetails?.activeLiveChatId;
        if (liveChatId) {
            console.log(`[YOUTUBE] Found live chat! ID: ${liveChatId}`);
            return liveChatId;
        } else {
            console.error(`[YOUTUBE] No activeLiveChatId found. Raw item:`, videoData.items[0]);
        }
        return null;

    } catch (err) {
        console.error('[YOUTUBE] Error fetching live chat ID:', err.message, err);
        return null;
    }
}

/**
 * Polls the live chat for new messages.
 * @param {string} apiKey - Your YouTube Data API key.
 * @param {function} onMessage - The callback function to handle new messages.
 */
async function pollChatMessages(apiKey, onMessage) {
    try {
        const chatUrl = `https://www.googleapis.com/youtube/v3/liveChat/messages?part=snippet,authorDetails&liveChatId=${liveChatId}&key=${apiKey}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
        const response = await fetch(chatUrl);
        const data = await response.json();

        const messages = data.items || [];
        for (const msg of messages) {
            const type = msg.snippet.type;
            if (type === 'superChatEvent') {
                onMessage('YouTube', msg.authorDetails.displayName, `SuperChat: ${msg.snippet.superChatDetails.amountDisplayString} - ${msg.snippet.superChatDetails.userComment}`);
            } else if (type === 'membershipItem') {
                onMessage('YouTube', msg.authorDetails.displayName, `became a member!`);
            } else if (type === 'textMessageEvent') {
                onMessage('YouTube', msg.authorDetails.displayName, msg.snippet.displayMessage);
            }
        }

        nextPageToken = data.nextPageToken;
        const suggestedInterval = data.pollingIntervalMillis || 5000;

        if (chatPollingTimeout) clearTimeout(chatPollingTimeout);
        chatPollingTimeout = setTimeout(() => pollChatMessages(apiKey, onMessage), suggestedInterval);

    } catch (err) {
        console.error('[YOUTUBE] Error polling chat messages:', err.message, err);
    }
}

/**
 * Connects to the YouTube chat service.
 * @param {string} apiKey - Your YouTube Data API key.
 * @param {string} channelId - The ID of the YouTube channel to monitor.
 * @param {function} onMessage - The callback function to handle new messages.
 */
export async function connectYouTube(apiKey, channelId, onMessage) {
    console.log('[YOUTUBE] Attempting to connect...');

    // Periodically check for a live stream until one is found.
    const findStreamInterval = setInterval(async () => {
        liveChatId = await getLiveChatId(apiKey, channelId);

        if (liveChatId) {
            // Once the stream is found, stop checking for it and start polling for chat.
            clearInterval(findStreamInterval);
            console.log('[YOUTUBE] Successfully connected to live stream. Starting chat polling...');
            pollChatMessages(apiKey, onMessage);
        }
    }, 15000); // Check for a live stream every 15 seconds.
}

