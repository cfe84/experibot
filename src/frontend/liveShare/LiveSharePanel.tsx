import * as React from "react";
import { meeting } from "@microsoft/teams-js";
import { DefaultButton, Text } from "@fluentui/react";

const styles = {
  default: {
    color: "white"
  }
}

export function LiveSharePanel() {
  function share() {
    meeting.shareAppContentToStage((err, res) => {
      if (res) {

      }
    }, `${window.location.origin}/meetings/liveShare/stage.html?theme={theme}` );
  }
  return <div style={styles.default}>
    <Text>Start live share</Text>
    <DefaultButton onClick={share}>Share to stage</DefaultButton>
  </div>
}