export interface User {
  id: string,
  name: string
}

export interface Product {
  id: string,
  name: string
}

export function configurePaymentCard(users: User[], products: Product[]) {
  const userComponents = users.map(user => ({
    type: "Input.Toggle",
    id: `user-${user.id}`,
    title: user.name,
    valueOn: "true",
    valueOff: "false"
  }))
  const productChoiceComponent = products.map((product) => ({
    "title": product.name,
    "value": product.id
  }))
  return {
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    type: "AdaptiveCard",
    originator: "c9b4352b-a76b-43b9-88ff-80edddaa243b",
    version: "1.4",
    body: [
      {
        type: "TextBlock",
        text: `Select product:`,
        wrap: true,
      },
      {
        "type": "Input.ChoiceSet",
        id: "productId",
        "choices": productChoiceComponent,
        placeholder: "Select product"
      },
      {
        type: "TextBlock",
        text: `Send payment to`,
        wrap: true,
      },
      ...userComponents,

    ],
    "actions": [
      {
        "type": "Action.Submit",
        "title": "Send charge",
        "associatedInputs": "auto",
        data: {
          action: "sendPaymentRequest"
        }
      }
    ]
  };
}
