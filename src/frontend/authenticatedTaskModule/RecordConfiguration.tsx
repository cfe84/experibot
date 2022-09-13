import * as React from "react";
import { PrimaryButton, Label, MessageBar, MessageBarType, Text, TextField, Spinner } from "@fluentui/react";
import { app, authentication, dialog } from "@microsoft/teams-js";
import { Record, RecordRequest } from "../../infrastructure/botHandlers/AuthenticationBridgeHandler";
import { callBackend } from "../callBackend";

interface ContextInfo {
  chatId: string,
  tenantId: string
}

/**
 * React functional component that allows to configure a "Record" to be used in
 * the AuthenticationBridge demo
 * @returns
 */
export function RecordConfiguration() {
  const [inputValue, setInputValue] = React.useState("");
  const [token, setToken] = React.useState<string|undefined>(undefined);
  const [contextInfo, setContextInfo] = React.useState<ContextInfo | undefined>(undefined);
  const [error, setError] = React.useState<string>("");
  const [message, setMessage] = React.useState<string>("");
  const [sending, setSending] = React.useState(false);

  /**
   * Grab stuff from the Teams context:
   * - Auth to AAD
   * - Get chatId from context.
   */
  async function authenticateAsync() {
    console.log(`Authenticating`)
    await app.initialize();
    setToken(await authentication.getAuthToken());
    const context = await app.getContext();
    console.log(context);
    setContextInfo({
      chatId: context.chat?.id as string, 
      tenantId: context.user?.tenant?.id as string
    });
  }

  /**
   * Run only once.
   */
  React.useEffect(() => {
    setTimeout(() => {authenticateAsync().then()}, 100);
  }, []);

  /**
   * Send the Record to the backend.
   */
  async function sendRecordAsync() {
    try {
      setSending(true);
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

  return <div>
    {message !== "" && <MessageBar messageBarType={MessageBarType.success}>{message}</MessageBar>}
    {error !== "" && <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>}
    <Text variant="large">Send request</Text>
    <Label>{ token !== undefined ? "✅" : "…"} Token</Label>
    <Label>{ contextInfo !== undefined ? "✅" : "…"} ChatId</Label>
    <TextField label={"An input"} onChange={(ev, val) => setInputValue(val || "")} value={inputValue}></TextField>
    <PrimaryButton 
      disabled={inputValue.length === 0 || token === undefined || contextInfo === undefined || sending }
      onClick={() => sendRecordAsync().then()}
      >Send</PrimaryButton>
    { sending && <Spinner label="Sending..." /> }
  </div>
}