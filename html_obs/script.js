// --- CONFIGURATION ---
const SB_WEBSOCKET_URL = 'ws://127.0.0.1:8080/';

// --- MAIN LOGIC ---
window.addEventListener('load', () => {
    connectws();
});

function connectws() {
    const ws = new WebSocket(SB_WEBSOCKET_URL);

    ws.onopen = () => {
        console.log('Connected to Streamer.bot');
    };

    ws.onmessage = (event) => {
        console.log('Raw message:', event.data); // Add this for debugging
        const eventData = JSON.parse(event.data);
        
        // Listen for our specific custom event from the C# code
        if (eventData.event && eventData.event === 'MultiChat') {
             // The actual message data is now in eventData.data
             addMessageToChat(eventData.data);
        }
    };

    ws.onclose = () => {
        console.log('Disconnected from Streamer.bot, retrying in 5 seconds...');
        setTimeout(connectws, 5000); // Attempt to reconnect
    };

    ws.onerror = (err) => {
        console.error('WebSocket Error:', err);
        ws.close();
    };
}

// This function can remain exactly the same as before, because our C# script
// now guarantees a consistent data format for it to work with!
function addMessageToChat(data) {
    const chatContainer = document.getElementById('chat-container');
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message');

    const platformIcon = document.createElement('img');
    platformIcon.classList.add('platform-icon');
    if (data.source.toLowerCase() === 'twitch') {
        platformIcon.src = 'https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c94346.png';
    } else if (data.source.toLowerCase() === 'youtube') {
        platformIcon.src = 'https://www.youtube.com/s/desktop/1b326317/img/favicon_32x32.png';
    }
    messageElement.appendChild(platformIcon);

    const userNameElement = document.createElement('span');
    userNameElement.classList.add('user-name');
    userNameElement.style.color = data.user.color; // Always gets a color now
    userNameElement.innerText = `${data.user.displayName}: `;
    messageElement.appendChild(userNameElement);
    
    const messageTextElement = document.createElement('span');
    messageTextElement.classList.add('message-text');
    messageTextElement.innerHTML = parseMessageWithEmotes(data.message.text, data.message.emotes);
    messageElement.appendChild(messageTextElement);
    
    chatContainer.appendChild(messageElement);
    
    while (chatContainer.children.length > 20) {
        chatContainer.removeChild(chatContainer.firstChild);
    }
}

function parseMessageWithEmotes(message, emotes) {
    // This function can also remain the same.
    // For YouTube, it will receive an empty 'emotes' array and just return the message text.
    if (!emotes || emotes.length === 0) {
        // Simple text sanitization to prevent HTML injection
        const tempDiv = document.createElement('div');
        tempDiv.innerText = message;
        return tempDiv.innerHTML;
    }

    let replacements = emotes.sort((a, b) => b.startIndex - a.startIndex);
    let output = message;
    
    replacements.forEach(emote => {
        let emoteImg = `<img src="${emote.imageUrl}" class="emote" alt="${emote.name}">`;
        output = output.substring(0, emote.startIndex) + emoteImg + output.substring(emote.endIndex + 1);
    });

    return output;
}