import * as React from "react";
import { meeting } from "@microsoft/teams-js";
import { DefaultButton, Text } from "@fluentui/react";
import { v4 as uuid } from "uuid";

const styles = {
  default: {
    color: "white"
  }
}

export function LiveSharePanel() {
  function share() {
    const sessionId = uuid();
    meeting.shareAppContentToStage((err, res) => {
    }, `${window.location.origin}/meetings/liveShare/stage.html?&sessionId=${sessionId}`);
  }
  return <div>
    <Text style={styles.default}>Start live share</Text><br/>
    <DefaultButton onClick={share}>Launch mine sweeper</DefaultButton>
  </div>
}