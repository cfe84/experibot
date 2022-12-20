import { Stack, TextField } from "@fluentui/react";
import { LiveShareClient } from "@microsoft/live-share";
import { app, LiveShareHost } from "@microsoft/teams-js";
import { SharedString, SharedMap } from "fluid-framework";

import * as React from "react";

const styles = {
  default: {
    color: "white"
  }
}

const VAL_KEY = "val";

export function LiveShareStage() {
  const [ name, setName ] = React.useState("");
  const [ map, setMap ] = React.useState<SharedMap | null>(null);

  function changeName(name: string) {
    setName(name);
    if (map) {
      map.set(VAL_KEY, name);
    }
  }

  async function joinContainer() {
    const host = LiveShareHost.create();
    const liveShare = new LiveShareClient(host);
    const schema = {
      initialObjects: { 
        val: SharedMap
      },
    };
    const { container } = await liveShare.joinContainer(schema);
    return container;
  }

  async function init() {
    console.log(`Initializing stage`);
    await app.initialize();
    const container = await joinContainer();
    const map = container.initialObjects.val as SharedMap;
    setMap(map);
    map.on("valueChanged", (val, isLocal, target) => {
      if (!isLocal) {
        setName(map.get(VAL_KEY) as string);        
      }
    });
  }

  React.useEffect(() => {
    init().then();
  }, [name])

  return <div style={styles.default}>
    <Stack>
      <Stack.Item align="center">And we're live {name}</Stack.Item>
      <TextField onChange={(_, val) => changeName(val || "")} value={name}></TextField>
    </Stack>
  </div>
}