export function welcomeCard(username: string, userId: string, tenantId: string) {
  return {
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    type: "AdaptiveCard",
    version: "1.0",
    body: [
      {
        type: "TextBlock",
        text: `Thanks for installing experibot. I know that you joined us ${username}! Your user id is ${userId} and your tenant id is ${tenantId}`,
        wrap: true,
      },
      {
        type: "ActionSet",
        separator: "true",
        actions: [{
          type: "Action.Submit",
          title: "Get help!",
          data: {
            text: "help",
          },
        }],
      },
    ],
  };
}
