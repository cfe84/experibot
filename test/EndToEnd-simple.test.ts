import * as dotenv from "dotenv"
import * as should from "should"
import * as td from "testdouble"
import { Activity, DirectLine, Message } from "botframework-directlinejs"

// Expects websocket in the env so we load it
(global as any).XMLHttpRequest = require('xhr2');
(global as any).WebSocket = require('ws');
// Get directline secret in .env
dotenv.config()

const TEST_USER_ID = "test-user-id"
type activityDelegate = (a: Activity) => void

const getMessageAwaiter = (client: DirectLine) => {
  const lineup: Activity[] = []
  const resolvers: (activityDelegate)[] = []

  const subscription = client.activity$.subscribe((activity) => {
    if (activity.from.id === TEST_USER_ID) {
      // ignored because message is mine
    } else {
      if (resolvers.length) {
        const resolver = resolvers.shift() as activityDelegate
        resolver(activity)
      } else {
        lineup.push(activity)
      }
    }
  })
  return {
    nextMessageAsync: (): Promise<Activity> => new Promise((resolve) => {
      if (lineup.length) {
        resolve(lineup.shift() as Activity)
      } else {
        resolvers.push(resolve)
      }
    }),
    close: () => {
      subscription.unsubscribe()
    }
  }
}

describe("End to end tests", async function () {

  const client = new DirectLine({
    secret: process.env["DirectLineSecret"],
  })
  const awaiter = getMessageAwaiter(client)

  it("handles hello", async function () {

    const askForHelp: Message = {
      type: "message",
      from: {
        id: TEST_USER_ID,
        name: "bob"
      },
      text: "help"
    }

    await new Promise((resolve, reject) =>
      client
        .postActivity(askForHelp)
        .subscribe(resolve, reject)
    )

    const message = await awaiter.nextMessageAsync()

    const attachments = (message as any).attachments as any[]
    should(attachments).have.lengthOf(1)
    const card = attachments[0]
    should(card.contentType).eql("application/vnd.microsoft.card.adaptive")
    should(card.content.body[0].text.indexOf("Supported commands")).greaterThan(-1)
  })

  this.afterAll(() => {
    awaiter.close()
  })
})


