// youtube.js
// Handles the connection to YouTube Live chat using the OFFICIAL YouTube Data API.
// This method is more reliable than scraping libraries.

import { google } from 'googleapis';

const youtube = google.youtube('v3');
let liveChatId = null;
let nextPageToken = null;
let chatPollingInterval = null;

/**
 * A helper function to find the active live stream for a given channel.
 * @param {string} apiKey - Your YouTube Data API key.
 * @param {string} channelId - The ID of the YouTube channel.
 * @returns {string|null} The ID of the active live chat, or null if not found.
 */
async function getLiveChatId(apiKey, channelId) {
    try {
        // Step 1: Find the active live broadcast Video ID.
        const searchResponse = await youtube.search.list({
            part: 'snippet',
            channelId: channelId,
            eventType: 'live',
            type: 'video',
            key: apiKey,
        });

        const liveBroadcast = searchResponse.data.items[0];
        if (!liveBroadcast) {
            console.log(`[YOUTUBE] No active live stream found for channel ${channelId}. Retrying...`);
            return null;
        }
        const videoId = liveBroadcast.id.videoId;

        // Step 2: Use the Video ID to get the Live Chat ID.
        const videoResponse = await youtube.videos.list({
            part: 'liveStreamingDetails',
            id: videoId,
            key: apiKey,
        });

        const liveChatId = videoResponse.data.items[0]?.liveStreamingDetails?.activeLiveChatId;
        if (liveChatId) {
            console.log(`[YOUTUBE] Found live chat! ID: ${liveChatId}`);
            return liveChatId;
        }
        return null;

    } catch (err) {
        console.error('[YOUTUBE] Error fetching live chat ID:', err.message);
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
        const response = await youtube.liveChatMessages.list({
            part: 'snippet,authorDetails',
            liveChatId: liveChatId,
            pageToken: nextPageToken,
            key: apiKey,
        });

        const newMessages = response.data.items;
        if (newMessages.length > 0) {
            for (const message of newMessages) {
                onMessage(
                    'YouTube',
                    message.authorDetails.displayName,
                    message.snippet.displayMessage
                );
            }
        }

        nextPageToken = response.data.nextPageToken;
        // Use the polling interval suggested by the API, or default to 5 seconds.
        const suggestedInterval = response.data.pollingIntervalMillis || 5000;

        // Clear previous interval and set a new one
        if (chatPollingInterval) clearInterval(chatPollingInterval);
        chatPollingInterval = setInterval(() => pollChatMessages(apiKey, onMessage), suggestedInterval);

    } catch (err) {
        console.error('[YOUTUBE] Error polling chat messages:', err.message);
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

