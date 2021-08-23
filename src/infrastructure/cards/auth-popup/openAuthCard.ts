export function openAuthCard() {
  return {
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    type: "AdaptiveCard",
    originator: "c9b4352b-a76b-43b9-88ff-80edddaa243b",
    version: "1.4",
    body: [
      {
        type: "TextBlock",
        text: `This will open an auth popup`,
        wrap: true,
      },
    ],
    actions: [
      {
        type: "Action.Submit",
        title: "Open auth popup",
        verb: "openAuthPopup",
        data: {
          msteams: {
            type: "signin",
            title: "Click me for signin",
            value: "https://rlay.feval.ca/auth/"
          },
          module: "authentication",
        },
      }
    ],
  };
}
