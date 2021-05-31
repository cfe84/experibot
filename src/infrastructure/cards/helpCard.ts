export function helpCard(actions: { [key: string]: string }, text: string) {
  const actionNames = Object.values(actions)
    .map((action) => `\n- ${action}`)
    .join();
  const buttons = Object.values(actions).map((action) => ({
    type: "Action.Submit",
    title: action,
    data: {
      text: action,
    },
  }));
  return {
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    type: "AdaptiveCard",
    version: "1.0",
    body: [
      {
        type: "TextBlock",
        text: `I received ${text}. Supported commands are: ${actionNames}`,
        wrap: true,
      },
      {
        type: "ActionSet",
        separator: "true",
        actions: buttons,
      },
    ],
  };
}
