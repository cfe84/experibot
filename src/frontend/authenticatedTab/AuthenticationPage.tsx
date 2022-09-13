import * as React from "react";
import { PrimaryButton, DefaultButton, Label, MessageBar, MessageBarType, Stack, Text } from "@fluentui/react";
import { app, authentication } from "@microsoft/teams-js";
import { UserInfo } from "../../domain/UserInfo";
import { callBackend } from "../callBackend";

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

  async function getUserInfoFromBackendAsync(token: string): Promise<UserInfo> {
    return callBackend(`/api/users/me`, "GET", undefined, token);
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