using System;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;

public class CPHInline
{
    public bool Execute()
    {
        // Create a dictionary to hold our standardized chat message data.
        var messageData = new Dictionary<string, object>();

        // The 'platform' argument is automatically available from the trigger.
        string platform = args["platform"].ToString();
        messageData["source"] = platform;

        // --- NORMALIZE THE DATA BASED ON PLATFORM ---
        if (platform == "Twitch")
        {
            // Pull Twitch-specific arguments.
            // The 'user' object is a dictionary with user details.
            var user = args["user"] as Dictionary<string, object>;
            
            messageData["user"] = new Dictionary<string, object>
            {
                { "name", args["user"].ToString() },
                { "displayName", args["displayName"].ToString() },
                { "color", args["color"].ToString() },
                // The 'badges' object needs to be passed through directly.
                { "badges", args["badges"] } 
            };
            
            messageData["message"] = new Dictionary<string, object>
            {
                { "text", args["message"].ToString() },
                // The 'emotes' object needs to be passed through directly.
                { "emotes", args["emotes"] }
            };
        }
        else if (platform == "YouTube")
        {
            // Pull YouTube-specific arguments.
            // The 'author' object contains user details for YouTube.
            var author = args["author"] as Dictionary<string, object>;
            
            messageData["user"] = new Dictionary<string, object>
            {
                { "name", author["name"].ToString() },
                { "displayName", author["displayName"].ToString() },
                // YouTube doesn't have user colors, so we send a default.
                { "color", "#FFFFFF" }, 
                // YouTube doesn't have badges in the same way, send empty.
                { "badges", new JArray() } 
            };

            messageData["message"] = new Dictionary<string, object>
            {
                { "text", args["message"].ToString() },
                // YouTube doesn't have emotes in the same way, send empty.
                { "emotes", new JArray() }
            };
        }
        else 
        {
            // If another platform is added, it will be ignored for now.
            return true;
        }

        // --- BROADCAST THE DATA ---
        // We wrap our data in a parent object to give our event a name.
        var broadcastPayload = new Dictionary<string, object>
        {
            // This is our custom event name that the JavaScript will listen for.
            { "event", "MultiChat" }, 
            { "data", messageData }
        };

        // Use the built-in CPH method to broadcast the dictionary as a JSON string.
        CPH.WebsocketBroadcastJson(Newtonsoft.Json.JsonConvert.SerializeObject(broadcastPayload));

        // Return true to indicate the action succeeded.
        return true;
    }
}