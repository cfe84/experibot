export function jitCard() {
  return {
    type: "AdaptiveCard",
    body: [
      {
        type: "TextBlock",
        text: `💲 Install the payment app is not installed in this conversation, click continue to install.`,
        wrap: true
      }
    ],
    actions: [
      {
        type: "Action.Submit",
        title: "Continue",
        data: {
          msteams: {
            justInTimeInstall: true
          },
          action: "configurePayment"
        }
      }
    ],
    version: "1.0"
  }
}