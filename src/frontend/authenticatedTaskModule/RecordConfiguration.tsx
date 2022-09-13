import * as React from "react";
import { PrimaryButton, DefaultButton, Label, MessageBar, MessageBarType, Stack, Text, TextField } from "@fluentui/react";
import { app, authentication, dialog } from "@microsoft/teams-js";
import { Record, RecordRequest } from "../../infrastructure/botHandlers/AuthenticationBridgeHandler";
import { callBackend } from "../callBackend";

interface ContextInfo {
  chatId: string,
  tenantId: string
}

export function RecordConfiguration() {
  const [inputValue, setInputValue] = React.useState("");
  const [token, setToken] = React.useState<string|undefined>(undefined);
  const [contextInfo, setContextInfo] = React.useState<ContextInfo | undefined>(undefined);
  const [error, setError] = React.useState<string>("");
  const [message, setMessage] = React.useState<string>("");

  async function authenticateAsync() {
    if (!token) {
      await app.initialize();
      setToken(await authentication.getAuthToken());
      return // Function will be called twice since we used "setToken"
    }
    if (!contextInfo) {
      const context = await app.getContext();
      console.log(context);
      setContextInfo({
        chatId: context.chat?.id as string, 
        tenantId: context.user?.tenant?.id as string
      });
    }
  }

  async function sendRequestAsync() {
    try {
      const record = {
        chatId: contextInfo?.chatId,
        tenantId: contextInfo?.tenantId,
        content: inputValue
      } as RecordRequest;
      const res = await callBackend<Record>("/api/records", "POST", record, token);
      setMessage(`Request sent ${res.content} from ${res.requesterId} in ${res.chatId}`);
      setTimeout(() => dialog.submit(), 2000)
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (!contextInfo || !token) {
    setTimeout(() => {authenticateAsync().then()}, 100);
  }

  return <div>
    {message !== "" && <MessageBar messageBarType={MessageBarType.success}>{message}</MessageBar>}
    {error !== "" && <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>}
    <h1>Send request</h1>
    <Label>{ token !== undefined ? "✅" : "…"} Token</Label>
    <Label>{ contextInfo !== undefined ? "✅" : "…"} ChatId</Label>
    <TextField label={"An input"} onChange={((ev, val) => setInputValue(val || ""))} value={inputValue}></TextField>
    <PrimaryButton 
      disabled={inputValue.length === 0 || token === undefined || contextInfo === undefined }
      onClick={() => sendRequestAsync().then()}
      >Send</PrimaryButton>
  </div>
}