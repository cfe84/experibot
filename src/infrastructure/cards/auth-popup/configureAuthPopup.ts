export function configureAuthPopup() {
  return {
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    type: "AdaptiveCard",
    originator: "c9b4352b-a76b-43b9-88ff-80edddaa243b",
    version: "1.4",
    body: [
      {
        type: "TextBlock",
        text: `Select product:`,
        wrap: true,
      },
      {
        "type": "Input.Text",
        id: "url",
        value: "https://rlay.feval.ca/authPopup/",
        placeholder: "URL"
      },
    ],
    "actions": [
      {
        "type": "Action.Submit",
        "title": "Go with popup",
        "associatedInputs": "auto",
        data: {
          action: "show auth popup"
        }
      }
    ]
  };
}
