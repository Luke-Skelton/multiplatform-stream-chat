# **Multi-Stream Chat Aggregator**

This is a simple Node.js application that connects to Twitch, YouTube, and TikTok live streams to aggregate chat messages and events into a single console window. It's designed to be a starting point for building a custom, unified chat display for streamers.

## **Setup Instructions**

1. **Install Node.js:** If you don't have it, download and install Node.js (which includes npm) from [https://nodejs.org/](https://nodejs.org/).  
2. **Install Dependencies:** Open your terminal or command prompt, navigate to this project's folder, and run the following command:  
   npm install

3. **Configure Credentials:**  
   * Rename the file .env.example to .env.  
   * Open the new .env file and fill in your details.

   **Getting your Twitch OAuth Token:**

   * To allow the application to connect to Twitch chat, you need an OAuth token.  
   * Go to [https://twitchapps.com/tmi/](https://twitchapps.com/tmi/).  
   * Log in with the Twitch account you want the bot to use (it can be your main account or a separate bot account).  
   * Click "Connect" and copy the entire token (it will look like oauth:xxxxxxxxxxxxxxxxxxxx).  
   * Paste this token into the TWITCH\_OAUTH\_TOKEN field in your .env file.  
4. **Find Your YouTube Channel ID:**  
   * Go to a video on the YouTube channel you want to monitor.  
   * Right-click on the channel's name and select "Copy Link Address".  
   * Paste the link somewhere; it will look like https://www.youtube.com/channel/UCxxxxxxxxxxxxxxxxx.  
   * The long string of characters starting with UC is your Channel ID. Paste this into the YOUTUBE\_CHANNEL\_ID field in your .env file.

## **Running the Application**

Once everything is set up, run the following command in your terminal:

npm start

If the credentials are correct and the streams are live (or have recent activity for YouTube), you will start seeing formatted chat messages and events from all three platforms appear in your terminal.