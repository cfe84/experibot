import * as  express from "express"
import { BotFrameworkAdapter, TurnContext } from 'botbuilder'
import { BotActivityHandler } from '../infrastructure/BotActivityHandler'
import { MemoryStore } from "../infrastructure/MemoryStore";
import path = require("path");

require('dotenv').config();
if (!process.env.BotId || !process.env.BotPassword) {
    throw Error(`Missing BotId or BotPassword in environment variables`)
}

const adapter = new BotFrameworkAdapter({
    appId: process.env.BotId,
    appPassword: process.env.BotPassword
});

adapter.onTurnError = async (context, error) => {
    console.error(`\n [onTurnError] unhandled error: ${error}`);

    await context.sendTraceActivity(
        'OnTurnError Trace',
        `${error}`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
    );

    await context.sendActivity('The bot encountered an error or bug.');
    await context.sendActivity('To continue to run this bot, please fix the bot source code.');
};

const store = new MemoryStore()
const botActivityHandler = new BotActivityHandler({ thingStore: store });
const server = express();
const port = process.env.port || process.env.PORT || 3978;
server.listen(port, () =>
    console.log(`Listening at http://localhost:${port}`)
);

const staticContentPath = path.join(__dirname, "static")
console.log(staticContentPath)
server.use(express.static(staticContentPath))

// Listen for incoming requests.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context: TurnContext) => {
        // Process bot activity
        await botActivityHandler.run(context);
    });
});
