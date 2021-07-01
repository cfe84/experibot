# Contents

Experibot is my all-round Teams platform experimental bot. It does nothing, but it uses a lot of Teams platform features.

To get an overview of all features currently available: @experibot help

## In-app authentication

This scenario leverages the [authentication popup](https://docs.microsoft.com/en-us/microsoftteams/platform/tabs/how-to/authentication/auth-tab-aad) to authenticate user _in the app_. The point there is to use a person's identity for the app, regardless of what their identity in Teams is. This can be used, for example, to authenticate a person using their MSA if they are connected with a work account, authenticate anonymous users with their MSA without having to add them as guests to a tenant, or authenticate users to any Oauth identity provider (Facebook, Google, etc.)

The mechanism to do so is the following:
1.	When the webpage is returned and authentication is required, a nonce is created in the backend bot and included in that page. Backend bot retains mapping between nonce and anonymous user id.
2.	The lobby webpage handles the authentication flow using the code exchange grant
3.	After successful auth to Azure AD, lobby app receives a callback containing the auth code.
4.	Lobby app calls the backend bot API with the nonce + auth code.
5.	Backend bot calls Azure AD with the auth code and exchange it for id_token and access_token, then maps the user’s MSA (or any other IP) identity with the anonymous user id identified with the nonce.
6.	From there on, app has a mapping telling that a given anonymous user id = a given MSA.

```mermaid
  sequenceDiagram;

  participant backend as Backend (bot)
  participant app as Web app

  note over backend: Client requests task<br/>module from bot
  backend -->> app: Load with nonce
  note over backend: Store: nonce = userId
  app -->> AAD: Redirect for auth
  note over AAD: User completes<br/> authentication
  AAD -->> app: Auth code
  app -->> backend: Auth code + nonce
  backend -->> AAD: Complete code exchange
  AAD -->> backend: id_token + access_token
  note over backend: Store: userId = MSA
```

To activate, call @experibot show task module then click Open TM (Webapp). This invokes [`handleTeamsTaskModuleFetch`](/src/infrastructure/BotActivityHandler.ts#L144) in the BotActivityHandler, which will load a task module from [the auth folder](/src/application/static/auth).

The [index](/src/application/static/auth/index.html) starts authentication by [invoking the JS library](/src/application/static/auth/index.html#L97). This opens the popup.


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

