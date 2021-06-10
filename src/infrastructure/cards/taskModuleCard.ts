export function taskModuleCard(count: number) {
  return {
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    type: "AdaptiveCard",
    originator: "c9b4352b-a76b-43b9-88ff-80edddaa243b",
    version: "1.4",
    body: [
      {
        type: "TextBlock",
        text: `This is the ${count}th task module`,
        weight: "Bolder",
        size: "Large",
        wrap: true,
      },
      {
        type: "TextBlock",
        text: `Enter a value here:`,
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
        title: "Validate and stop",
        verb: "triggerExtension",
        data: {
          msteams: {
            type: "task/submit",
          },
          button: "close",
        },
      },
      {
        type: "Action.Submit",
        id: "fromage",
        title: "Continue",
        verb: "triggerExtension",
        data: {
          msteams: {
            type: "task/fetch",
          },
          i: count,
          button: "continue",
        },
      },
    ],
  };
}
