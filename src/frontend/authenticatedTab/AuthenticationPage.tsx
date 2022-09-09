import * as React from "react";
import { PrimaryButton, Label, MessageBar, MessageBarType } from "@fluentui/react";
import { app, authentication } from "@microsoft/teams-js";

export function AuthenticationPage() {
  const [token, setToken] = React.useState("No token yet");
  const [error, setError] = React.useState("");

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
  
  return <div>
    {error !== "" && <MessageBar
      messageBarType={MessageBarType.error}
      isMultiline={false}
      dismissButtonAriaLabel="Close"
      onDismiss={() => setError("")}
    >{error}</MessageBar>}
    <Label>{token}</Label>
    <PrimaryButton onClick={() => authenticateAsync().then()}>Authenticate</PrimaryButton>
  </div>
}