// twitch.js
// This file handles all the connections and event listeners for Twitch.
// We are using the "Twurple" library, which is the modern standard for Twitch bots.

import { RefreshingAuthProvider } from '@twurple/auth';
import { ChatClient } from '@twurple/chat';
import { promises as fs } from 'fs';
import path from 'path';
import { EventSubHttpListener } from '@twurple/eventsub-http';
import { ApiClient } from '@twurple/api';
import { StaticAuthProvider } from '@twurple/auth';

// --- Token Management ---
const tokenPath = path.resolve(process.cwd(), 'tokens.json');

// --- Main Connection Function ---
export async function connectTwitch(clientId, clientSecret, channel, onMessage) {
  let tokenData;

  // Try to load existing tokens from our file.
  try {
    const tokenBuffer = await fs.readFile(tokenPath);
    tokenData = JSON.parse(tokenBuffer.toString());
  } catch (e) {
    console.error('[TWITCH] Could not read token file. Please ensure tokens.json is created and valid.');
    // Stop execution if we can't get a token.
    return;
  }

  const authProvider = new RefreshingAuthProvider(
    {
      clientId,
      clientSecret,
      onRefresh: async (newTokenData) => {
        await fs.writeFile(tokenPath, JSON.stringify(newTokenData, null, 4), 'UTF-8');
        console.log('[TWITCH] Token refreshed and saved to file.');
      }
    }
  );

  // --- THIS IS THE FIX ---
  // We must explicitly add the user to the provider, giving it the token
  // data and the "intents" (permissions) we want to use it for.
  await authProvider.addUserForToken(tokenData, ['chat']);
  // -----------------------

  const chatClient = new ChatClient({ authProvider, channels: [channel] });

  // --- Standard Chat Message ---
  chatClient.onMessage((channel, user, text, msg) => {
    onMessage('Twitch', user, text, msg.isAction);
  });

  // --- Subscription Events ---
  chatClient.onSub((channel, user, subInfo) => {
    onMessage('Twitch', '[SYSTEM]', `${user} just subscribed with a Tier ${subInfo.plan} subscription!`);
  });

  // --- Resubscription Events ---
  chatClient.onResub((channel, user, subInfo) => {
    onMessage('Twitch', '[SYSTEM]', `${user} re-subscribed for ${subInfo.months} months in a row!`);
  });

  // --- Raid Event ---
  chatClient.onRaid((channel, user, raidInfo) => {
    onMessage('Twitch', '[SYSTEM]', `${user} is raiding with ${raidInfo.viewerCount} viewers!`);
  });

  // --- Rituals ---
  chatClient.onRitual((channel, user, ritualInfo) => {
    if (ritualInfo.ritualName === 'new_chatter') {
        onMessage('Twitch', '[SYSTEM]', `${user} is new here! Welcome!`);
    }
  });

  // --- CONNECTION LOGIC ---
  chatClient.onConnect(() => {
    console.log(`[TWITCH] Successfully connected and listening to #${channel}`);
  });

  chatClient.onDisconnect((manually, reason) => {
    if (!manually && reason) {
      console.error(`[TWITCH] Disconnected unexpectedly:`, reason);
    }
  });

  // Connect to Twitch chat.
  await chatClient.connect();
}

// --- EventSub Setup Function ---
export async function setupTwitchEventSub(clientId, accessToken, channelId, onMessage) {
    const apiClient = new ApiClient({
        authProvider: new StaticAuthProvider(clientId, accessToken)
    });

    const listener = new EventSubHttpListener({
        apiClient,
        port: 8081, // must be public HTTPS for Twitch
    });

    await listener.listen();

    // Channel Point Redemptions
    listener.onChannelRedemptionAdd(channelId, event => {
        onMessage('Twitch', event.userName, `redeemed: ${event.rewardTitle}`);
    });

    // Follows
    listener.onChannelFollow(channelId, event => {
        onMessage('Twitch', event.userName, `just followed!`);
    });

    // Cheers (Bits)
    listener.onChannelCheer(channelId, event => {
        onMessage('Twitch', event.userName, `cheered ${event.bits} bits!`);
    });
}

