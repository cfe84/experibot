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

