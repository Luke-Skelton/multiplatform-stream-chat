# **Setup Guide: Your All-in-One Stream Chat Display**

Hey everyone\! This guide will walk you through setting up a custom chat box that shows your Twitch, YouTube, and TikTok chats all in one place. It runs locally on your computer, so it's completely private and secure.

Don't worry if you're not a "techy" person\! Just follow these steps one by one, and you'll be up and running in no time.

### **What You'll Need First**

1. **The Project Files:** The folder containing all the code for the chat display.  
2. **Node.js:** A program that lets your computer run the chat tool's backend. Download it here: [https://nodejs.org/](https://nodejs.org/) (get the "LTS" version).  
3. **Visual Studio Code:** A free and popular code editor that makes it easy to edit the configuration files. Download it here: [https://code.visualstudio.com/](https://code.visualstudio.com/)

### **Step 1: Install the Project**

This step is like installing the engine for your new chat tool.

1. **Unzip the Files:** Unzip the project folder you received and place it somewhere easy to find, like your Desktop.  
2. **Open in VS Code:** Launch Visual Studio Code. Go to File \> Open Folder and select the project folder you just unzipped. You'll see all the project files listed on the left-hand side.  
3. **Open the Terminal:** In VS Code, go to the top menu and click Terminal \> New Terminal. A command line will appear at the bottom of the window.  
4. **Install Dependencies:** In the terminal, type the following command and press Enter. This tells Node.js to download all the parts the tool needs to run.  
   npm install

   You'll see some text scroll by. Once it's finished, you're ready for the next step\!

### **Step 2: Get Your Secret Keys**

To read your chat, the tool needs permission. This involves getting a few "keys" from Twitch and YouTube.

#### **Part A: Twitch Setup**

1. **Go to the Twitch Developer Console:** [https://dev.twitch.tv/console/apps](https://dev.twitch.tv/console/apps) (Log in with your Twitch account).  
2. Click **"Register Your Application"**.  
3. Fill out the form:  
   * **Name:** Give it a simple name like My Chat App.  
   * **OAuth Redirect URLs:** Type http://localhost:3000 and click **Add**.  
   * **Category:** Choose **"Chat Bot"**.  
4. Click **"Create"**.  
5. On the next page, you'll see your **Client ID**. Copy this into a temporary text file.  
6. Click the **"New Secret"** button. Copy the **Client Secret** into the same text file. **Save this \- Twitch will only show it to you once\!**

#### **Part B: YouTube Setup**

1. **Go to the Google Cloud Console:** [https://console.cloud.google.com/](https://console.cloud.google.com/) (Log in with your Google account).  
2. At the top of the page, click the project dropdown and then **"New Project"**. Name it My Chat App and click **Create**.  
3. In the search bar at the top, type YouTube Data API v3 and click on it.  
4. Click the blue **"Enable"** button.  
5. Once enabled, click **"Credentials"** on the left menu.  
6. Click **"+ Create Credentials"** at the top, then select **"API key"**.  
7. A box will pop up with your new **API Key**. Copy this into your temporary text file.

### **Step 3: Configure the Tool**

Now we'll put all those keys and your channel info into the tool's configuration.

1. In VS Code, find the file named .env.example in the file list on the left.  
2. **Right-click** on .env.example and rename it to just .env.  
3. Open the .env file and fill in your details. **Make sure to keep the quotation marks\!**  
   * TWITCH\_CLIENT\_ID: Paste your Client ID from Twitch.  
   * TWITCH\_CLIENT\_SECRET: Paste your Client Secret from Twitch (**without** oauth: at the start).  
   * TWITCH\_CHANNEL: Your Twitch username, all lowercase.  
   * YOUTUBE\_API\_KEY: Paste your API Key from Google.  
   * YOUTUBE\_CHANNEL\_ID: Go to your YouTube channel, click your profile picture, and go to Settings \> Advanced settings. You'll find your Channel ID there.  
   * TIKTOK\_USERNAME: Your TikTok username, including the @ symbol (e.g., @yourname).

### **Step 4: Your One-Time Twitch Login**

This final setup step uses a command-line tool from Twitch to securely log in your app for the first time. **You only have to do this once\!**

1. **Download the Twitch CLI:** Go here and get the version for your computer: [https://dev.twitch.tv/docs/cli/download/](https://www.google.com/search?q=https://dev.twitch.tv/docs/cli/download/)  
2. **Unzip it** into a folder you can find easily.  
3. **In the VS Code terminal**, navigate to that folder. For example, if it's on your desktop, you might type: cd C:\\Users\\YourName\\Desktop\\twitch-cli-folder  
4. **Configure the CLI:** Run this command. It will ask for your Client ID and Secret you saved earlier. Paste them in when prompted.  
   twitch configure

5. **Get Your Token:** Run this command. It will open a browser window asking you to authorize your app. Click **Authorize**.  
   twitch token \-u \-s "chat:read chat:edit"

6. **Create tokens.json:**  
   * Back in VS Code, right-click in the empty space in the file list and select **"New File"**.  
   * Name the file tokens.json.  
   * The terminal will have printed a block of text. You need to copy parts of it into your new tokens.json file. Use this template and paste your values in:

{  
    "accessToken": "paste\_the\_access\_token\_here",  
    "refreshToken": "paste\_the\_refresh\_token\_here",  
    "scope": \[  
        "chat:read",  
        "chat:edit"  
    \],  
    "expiresIn": 0,  
    "obtainmentTimestamp": 0  
}

### **Step 5: Run Your Chat Display\!**

You're all set\! Here's how to use it every time you stream.

1. **Start the Server:** In the VS Code terminal (make sure you're back in the project folder, not the CLI folder), run:  
   npm start

   You should see messages saying the server has started. Keep this terminal window open\!  
2. **Open the Chat:** Go to your project folder in your computer's file explorer and **double-click the index.html file**.

Your beautiful new chat box will open in your browser, ready to display messages from all your platforms\!

### **Customization**

You can easily turn platforms on or off.

* Open the config.js file in VS Code.  
* Change true to false for any platform you don't want to connect to.  
* Save the file and restart the server (Ctrl+C in the terminal, then npm start again).

Enjoy your new tool\!