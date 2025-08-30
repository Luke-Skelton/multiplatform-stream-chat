using System;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;

public class CPHInline
{
    public bool Execute()
    {
        // Log all incoming argument keys and values for debugging
        CPH.LogDebug("---- Begin MultiChat Debug ----");
        foreach (var key in args.Keys)
        {
            var val = args[key] != null ? args[key].ToString() : "null";
            CPH.LogDebug($"Arg key: {key}, value: {val}");
        }

        var messageData = new Dictionary<string, object>();

        if (!args.ContainsKey("platform"))
        {
            CPH.LogError("FATAL: 'platform' key missing in args. Args received:");
            foreach (var key in args.Keys)
            {
                CPH.LogError($"Arg key: {key}, value: {args[key]?.ToString() ?? "null"}");
            }
            CPH.LogError("You must add a 'platform' key to your action arguments.");
            return false;
        }

        string platform = args["platform"].ToString();
        messageData["source"] = platform;

        if (platform == "Twitch")
        {
            args.TryGetValue("displayName", out object displayNameObj);
            args.TryGetValue("user", out object userObj);
            args.TryGetValue("color", out object colorObj);
            args.TryGetValue("badges", out object badgesObj);
            args.TryGetValue("message", out object messageObj);
            args.TryGetValue("emotes", out object emotesObj);

            if (messageObj == null)
            {
                CPH.LogError("Missing 'message' key for Twitch.");
                CPH.LogDebug("---- End MultiChat Debug ----");
                return true;
            }

            // Log Twitch values for debugging
            CPH.LogDebug($"Twitch user: {userObj?.ToString() ?? "null"}");
            CPH.LogDebug($"Twitch displayName: {displayNameObj?.ToString() ?? "null"}");
            CPH.LogDebug($"Twitch color: {colorObj?.ToString() ?? "null"}");
            CPH.LogDebug($"Twitch badges: {badgesObj?.ToString() ?? "null"}");
            CPH.LogDebug($"Twitch message: {messageObj?.ToString() ?? "null"}");
            CPH.LogDebug($"Twitch emotes: {emotesObj?.ToString() ?? "null"}");

            messageData["user"] = new Dictionary<string, object>
            {
                { "name", userObj?.ToString() ?? "Unknown" },
                { "displayName", displayNameObj?.ToString() ?? "Unknown" },
                { "color", colorObj?.ToString() ?? "#FFFFFF" },
                { "badges", badgesObj ?? new JArray() }
            };

            messageData["message"] = new Dictionary<string, object>
            {
                { "text", messageObj.ToString() },
                { "emotes", emotesObj ?? new JArray() }
            };
        }
        else if (platform == "YouTube")
        {
            args.TryGetValue("author", out object authorObj);
            args.TryGetValue("message", out object messageObj);

            if (messageObj == null)
            {
                CPH.LogError("Missing 'message' key for YouTube.");
                CPH.LogDebug("---- End MultiChat Debug ----");
                return true;
            }
            if (authorObj == null)
            {
                CPH.LogError("Missing 'author' key for YouTube.");
                CPH.LogDebug("---- End MultiChat Debug ----");
                return true;
            }

            var author = authorObj as Dictionary<string, object>;
            if (author == null)
            {
                CPH.LogError("YouTube 'author' object is not a dictionary.");
                CPH.LogDebug("---- End MultiChat Debug ----");
                return true;
            }

            // Log YouTube author keys and values
            foreach (var key in author.Keys)
            {
                var val = author[key] != null ? author[key].ToString() : "null";
                CPH.LogDebug($"YouTube author key: {key}, value: {val}");
            }

            string name = author.ContainsKey("name") ? author["name"]?.ToString() : "Unknown";
            string displayName = author.ContainsKey("displayName") ? author["displayName"]?.ToString() : "Unknown";

            CPH.LogDebug($"YouTube name: {name}");
            CPH.LogDebug($"YouTube displayName: {displayName}");
            CPH.LogDebug($"YouTube message: {messageObj?.ToString() ?? "null"}");

            messageData["user"] = new Dictionary<string, object>
            {
                { "name", name },
                { "displayName", displayName },
                { "color", "#FFFFFF" },
                { "badges", new JArray() }
            };

            messageData["message"] = new Dictionary<string, object>
            {
                { "text", messageObj.ToString() },
                { "emotes", new JArray() }
            };
        }
        else
        {
            CPH.LogError($"Unknown platform: {platform}");
            CPH.LogDebug("---- End MultiChat Debug ----");
            return true;
        }

        var broadcastPayload = new Dictionary<string, object>
        {
            { "event", "MultiChat" },
            { "data", messageData }
        };

        try
        {
            CPH.WebsocketBroadcastJson(Newtonsoft.Json.JsonConvert.SerializeObject(broadcastPayload));
            CPH.LogDebug("MultiChat event sent to WebSocket.");
        }
        catch (Exception ex)
        {
            CPH.LogError($"Exception during WebsocketBroadcastJson: {ex.Message}");
        }

        CPH.LogDebug("---- End MultiChat Debug ----");
        return true;
    }
}