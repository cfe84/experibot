export function activityStatusCard(completed: string[]) {
  return {
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
    "type": "AdaptiveCard",
    "originator": "c9b4352b-a76b-43b9-88ff-80edddaa243b",
    "version": "1.4",
    "body": [
      {
        "type": "TextBlock",
        "text": `This is the status card visible only by the initiator. These completed: ${completed.join(", ")}`,
        "wrap": true
      }
    ]
  }
}