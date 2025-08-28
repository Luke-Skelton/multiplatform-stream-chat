using System;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;

public class CPHInline
{
    public bool Execute()
    {
        var messageData = new Dictionary<string, object>();

        if (!args.TryGetValue("platform", out object platformObj))
        {
            CPH.LogError("Missing 'platform' key in args.");
            return false;
        }

        string platform = platformObj.ToString();
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
                return true;
            }

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
                return true;
            }
            if (authorObj == null)
            {
                CPH.LogError("Missing 'author' key for YouTube.");
                return true;
            }

            var author = authorObj as Dictionary<string, object>;
            if (author == null)
            {
                CPH.LogError("YouTube 'author' object is not a dictionary.");
                return true;
            }

            string name = author.ContainsKey("name") ? author["name"]?.ToString() : "Unknown";
            string displayName = author.ContainsKey("displayName") ? author["displayName"]?.ToString() : "Unknown";

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
            return true;
        }

        var broadcastPayload = new Dictionary<string, object>
        {
            { "event", "MultiChat" },
            { "data", messageData }
        };

        CPH.WebsocketBroadcastJson(Newtonsoft.Json.JsonConvert.SerializeObject(broadcastPayload));
        CPH.LogDebug("MultiChat event sent to WebSocket.");

        return true;
    }
}