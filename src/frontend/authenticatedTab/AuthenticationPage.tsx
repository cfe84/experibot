import * as React from "react";
import { PrimaryButton, DefaultButton, Label, MessageBar, MessageBarType, Stack, Text } from "@fluentui/react";
import { app, authentication } from "@microsoft/teams-js";
import { UserInfo } from "../../domain/UserInfo";

export function AuthenticationPage() {
  const [token, setToken] = React.useState("");
  const [error, setError] = React.useState("");
  const [userInfo, setUserInfo] = React.useState<UserInfo | undefined>(undefined);

  async function authenticateAsync() {
    try {
      await app.initialize();
      const token = await authentication.getAuthToken()
      setToken(token)
    } catch(ex: any) {
      console.error(ex);
      setError(ex.message);
    }
  }

  function getUserInfoFromBackendAsync(token: string): Promise<UserInfo> {
      return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest()
        request.onreadystatechange = function () {
          if (this.readyState === 4) {
            try {
              const contentType = this.getResponseHeader("content-type");
              if (contentType?.startsWith("application/json")) {
                const response = JSON.parse(this.responseText) as UserInfo
                resolve(response)
              } else {
                reject(Error(`Unsupported response type: ${contentType}`))
              }
            } catch (err) {
              reject(Error(this.responseText))
            }
          }
        }
        request.open("GET", `/api/users/me`, true);
        request.setRequestHeader("Authorization", `Bearer ${token}`);
        request.send();
      })
  }

  async function validateToken() {
    try {
      const userInfo = await getUserInfoFromBackendAsync(token);
      setUserInfo(userInfo);
    } catch(error: any) {
      setError(error.message);
    }
  }

  function reset() {
    setUserInfo(undefined);
    setError("");
    setToken("");
  }

  function displayError(error: string) {
    return <MessageBar
      messageBarType={MessageBarType.error}
      isMultiline={false}
      dismissButtonAriaLabel="Close"
      onDismiss={() => setError("")}
    >{error}</MessageBar>
  }

  function displayUserInfo(userInfo: UserInfo) {
    return <div>
      <Stack>
        <MessageBar
        messageBarType={MessageBarType.success}
        > Validation successful!</MessageBar>
        <Label>AAD Object Id:</Label><Text>{userInfo.aadObjectId}</Text>
        <Label>Preferred username:</Label><Text>{userInfo.username}</Text>
      </Stack>
    </div>
  }

  function displayToken(token: string) {
    return <>
      <Label>{token}</Label>
      <br/>
      <PrimaryButton onClick={() => validateToken().then()}>Validate token in backend</PrimaryButton>
    </>
  }

  function displayAuthenticate() {
    return <PrimaryButton onClick={() => authenticateAsync().then()}>Authenticate</PrimaryButton>
  }
  
  return <div>
    <div>
      {error !== "" && displayError(error)}
      {token === "" && displayAuthenticate()}
      {!userInfo && token !== "" && displayToken(token)}
      {userInfo !== undefined && displayUserInfo(userInfo)}
    </div>
    <div>
      <DefaultButton onClick={reset}>Reset</DefaultButton>
    </div>
  </div>
}