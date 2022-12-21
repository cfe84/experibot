import { DefaultButton, Spinner, Stack, TextField } from "@fluentui/react";
import { LiveShareClient } from "@microsoft/live-share";
import { app, LiveShareHost } from "@microsoft/teams-js";
import { SharedString, SharedMap } from "fluid-framework";
import { Cell } from "./Cell";

import * as React from "react";

const styles = {
  default: {
    color: "white"
  },
  input: {
    width: "300px",
  }
}

const VAL_KEY = "val";
const width = 25;
const height = 25;

export function LiveShareStage() {
  const [ cells, setCells ] = React.useState<JSX.Element[][]>([]);
  const [ name, setName ] = React.useState<string>("");

  function createCells(map: SharedMap) {
    const cells: JSX.Element[][] = [];
    for (let r = 0; r < height; r++) {
      const row: JSX.Element[] = [];
      cells.push(row);
      for (let c = 0; c < width; c++) {
        row.push(<Cell color="black" row={r} col={c} map={map}></Cell>);
      }
    }
    return cells;
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
    const cells = createCells(map);
    setCells(cells);

    const context = await app.getContext();
    setName(context.user?.displayName || "UNKNOWN");
  }

  React.useEffect(() => {
    init().then();
  }, [cells])

  return <div style={styles.default}>
    <Stack>
      <Stack.Item align="center"><h1>{name}</h1></Stack.Item>
      <Stack.Item align="center">
        { cells.length ? cells.map(row => <div>{...row}</div>) : <Spinner label="Loading..." /> }
      </Stack.Item>
    </Stack>
  </div>
}