# Contents

Experibot is my all-round Teams platform experimental bot. It does nothing, but it uses a lot of Teams platform features.

To get an overview of all features currently available: @experibot help

Review [demonstrated features](./docs/features.md)

# Use

## Setup your bot and update the manifest

Teams is using the bot service to determine what endpoint to call. The manifest contains an `id` currently pointing to my bot. You need to create yours. To do so, either:

1. Do it manually: go to https://portal.azure.com, create a new Azure Bot resource
2. Through the VS Code Teams extension.



## Config

Create a `.env` file, enter 
```
BotId=
BotPassword=
BaseUrl=[URL from ngrok or rlay]
LOGLEVEL=Debug
```

For authentication popup, create an [AAD B2C tenant](https://docs.microsoft.com/en-us/azure/active-directory-b2c/tutorial-create-tenant) in Azure, [register an app](https://docs.microsoft.com/en-us/azure/active-directory-b2c/tutorial-register-applications?tabs=app-reg-ga), then add the following entries:

```
TenantId=[Set your own AAD B2C tenant id]
AADAppId=[Set your own AAD App id]
AADClientSecret=[Set the AAD B2C client secret]
```

## Run

- Run [Rlay](https://www.feval.ca/posts/rlay) (`rlay --port 3978`) or Ngrok `ngrok http -host-header=rewrite 3978`
- Update bot endpoint to point to the reverse proxy server, and BaseUrl in `.env` file.
- Zip appManifest and deploy to your tenant
- Run `npm start`

# Features

## Tab SSO

This is leveraging [SSO for tab app](https://docs.microsoft.com/en-us/microsoftteams/platform/tabs/how-to/authentication/tab-sso-overview). It requires:
- Setup API in your app registration (follow [this doc](https://docs.microsoft.com/en-us/microsoftteams/platform/tabs/how-to/authentication/tab-sso-register-aad) all the way through)
- Update manifest so it points to the right API.

Once this is done, tab will receive an auth token for the app. It needs to be validated for the right audience and issuer and validate the signature. The token contains the AAD object id (`oid` in the claims) that can be matched with the `aadObjectId` in the `from` section of activities received by the bot to reconcile identity.

in .env:
- Set BotId, will be used as the audience
- Set TenantId, will be used as issuer.

- [Frontend part](./src/frontend/authenticatedTab/AuthenticationPage.tsx)
- [Validate token](./src/infrastructure/middleware/TokenValidator.ts)
- [Middleware](./src/infrastructure/middleware/AuthenticationMiddleware.ts)

## Authentication Bridge

Run using the messaging extension called "Authenticated task module".

Demo of how to bridge authentication between Task Modules using web apps (not adaptive cards), and bots.

The task module uses [SSO for apps](https://docs.microsoft.com/en-us/microsoftteams/platform/tabs/how-to/authentication/tab-sso-overview) to retrieve an auth token, and passes that token as authentication to the backend.

Backend uses the AAD Object Id from the token claims to reconcile the identity of bot messages, which also includes the AAD Object id in the `activity.from` for authenticated users.

This also demos caching the conversation reference to be able to initiate a card exchange following the task module display.

Contains two main aspects: 

- [Record configuration - the front end part](./src/frontend/authenticatedTaskModule/RecordConfiguration.tsx)
- [Authentication bridge handler - the backend part](./src/infrastructure/botHandlers/AuthenticationBridgeHandler.ts)