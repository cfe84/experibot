export function confirmPaymentCard(productDescription: string) {
  return {
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    type: "AdaptiveCard",
    originator: "c9b4352b-a76b-43b9-88ff-80edddaa243b",
    version: "1.4",
    body: [
      {
        type: "TextBlock",
        text: `You completed the following payment, thank you.`,
        wrap: true,
      },
      {
        type: "TextBlock",
        text: `**${productDescription}**`,
        wrap: true,
      },
    ],
  };
}
