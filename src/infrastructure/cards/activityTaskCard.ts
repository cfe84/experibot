export function activityTaskCard(activityId: string, initiatorId: string) {
  return {
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    type: "AdaptiveCard",
    originator: "c9b4352b-a76b-43b9-88ff-80edddaa243b",
    version: "1.4",
    body: [
      {
        type: "TextBlock",
        text: `Let's pretend that you complete the activity.`,
        wrap: true,
      },
    ],
    actions: [
      {
        type: "Action.Submit",
        id: "activity.completeActivity",
        title: "Complete the activity",
        data: {
          initiatorId,
          activityId,
          text: "complete activity",
        },
      }
    ],
  };
}
