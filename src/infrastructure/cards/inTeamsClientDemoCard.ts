export function inTeamsClientDemoCard() {
  return {
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
    "type": "AdaptiveCard",
    "version": "1.5",
    "body": [
      {
        "id": "ac-text-block-1",
        "type": "TextBlock",
        "text": "test script"
      },
      {
        "id": "ac-input-eval",
        "type": "Input.Text"
      }
    ],
    "actions": [
      {
        "type": "Action.Submit",
        "title": "Run Script",
        "data": {
          "msteams": {
            "type": "script",
            "mode": "default"
          }
        }
      }
    ]
  };
}