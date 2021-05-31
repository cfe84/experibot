export function messageExtensionActionCard() {
  return {
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    type: "AdaptiveCard",
    originator: "c9b4352b-a76b-43b9-88ff-80edddaa243b",
    version: "1.4",
    body: [
      {
        type: "TextBlock",
        text: `The value`,
        weight: "Bolder",
        size: "Medium",
        wrap: true,
      },
      {
        type: "Input.Text",
        id: "theValue",
        placeholder: `This is the placeholder.`,
        wrap: true,
      },
    ],
    actions: [
      {
        type: "Action.Submit",
        id: "fromage",
        title: "Open",
        verb: "triggerExtension",
        data: {
          msteams: {
            type: "task/fetch",
          },
          module: "triggerExtension",
        },
      },
    ],
  };
}
