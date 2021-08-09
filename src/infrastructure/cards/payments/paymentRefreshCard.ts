export function paymentRefreshCard(paymentRequestId: string, userIds: string[]) {
  return {
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
    "type": "AdaptiveCard",
    "originator": "c9b4352b-a76b-43b9-88ff-80edddaa243b",
    "version": "1.4",
    "refresh": {
      "action": {
        "type": "Action.Execute",
        "title": "Submit",
        "data": {
          "handler": "payments",
          paymentRequestId
        }
      },
      userIds
    },
    "body": [
      {
        "type": "TextBlock",
        "text": `A payment was requested from other participants. Don't worry about it.`,
        "wrap": true
      }
    ]
  }
}