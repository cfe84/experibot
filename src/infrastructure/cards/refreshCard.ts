export function refreshCard(date: string, name: string, userIds: string[]) {
  return {
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
    "type": "AdaptiveCard",
    "originator": "c9b4352b-a76b-43b9-88ff-80edddaa243b",
    "version": "1.4",
    "refresh": {
      "action": {
        "type": "Action.Execute",
        "title": "Submit",
        "verb": "refreshCard"
      },
      "userIds": userIds
    },
    "body": [
      {
        "type": "TextBlock",
        "text": `Message refreshed at ${date} for ${name}
        Refreshing for ${userIds}`,
        "wrap": true
      }
    ],
    "actions": [
      {
        "type": "Action.Execute",
        "title": "Refresh now",
        "verb": "refreshCard"
      }
    ]
  }
}