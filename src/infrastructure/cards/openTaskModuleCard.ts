export function openTaskModuleCard() {
  return {
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    type: "AdaptiveCard",
    originator: "c9b4352b-a76b-43b9-88ff-80edddaa243b",
    version: "1.4",
    body: [
      {
        type: "TextBlock",
        text: `This will open a task module`,
        wrap: true,
      },
    ],
    actions: [
      {
        type: "Action.Submit",
        id: "fromage",
        title: "Open webapp TM",
        verb: "openTaskModule",
        data: {
          msteams: {
            type: "task/fetch",
          },
          module: "webapp",
        },
      },
      {
        type: "Action.Submit",
        id: "saucisson",
        title: "Open card TM",
        verb: "openTaskModuleCard",
        data: {
          msteams: {
            type: "task/fetch",
          },
          module: "card",
        },
      },
    ],
  };
}
