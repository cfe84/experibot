export function paymentRequestedCard(paymentRequestId: string, initiatorId: string, product: any) {
  return {
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    type: "AdaptiveCard",
    originator: "c9b4352b-a76b-43b9-88ff-80edddaa243b",
    version: "1.4",
    body: [
      {
        type: "TextBlock",
        text: `A payment request of $${product.price} was made for ${product.name}.`,
        wrap: true,
      },
    ],
    actions: [
      {
        type: "Action.Submit",
        id: "payment.completePayment",
        title: "Complete the activity",
        data: {
          initiatorId,
          paymentRequestId,
          text: "complete payment",
          msteams: {
            type: "task/fetch",
          },
          module: "payment",
        },

      }
    ],
  };
}
