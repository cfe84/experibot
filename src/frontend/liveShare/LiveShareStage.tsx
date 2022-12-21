import { DefaultButton, Spinner, Stack, StackItem, TextField } from "@fluentui/react";
import { LiveShareClient } from "@microsoft/live-share";
import { app, LiveShareHost } from "@microsoft/teams-js";
import { SharedString, SharedMap } from "fluid-framework";
import { Cell } from "./Cell";
// yuk...
import { Board } from "../../infrastructure/apiHandlers/MineSweeperApiHandler"

import * as React from "react";

const styles = {
  default: {
    color: "white"
  },
  input: {
    width: "300px",
  }
}

async function getBoardAsync(): Promise<Board> {
  const terms = window.location.search.substring(1).split("&");
  const queryParams: Record<string, string | boolean> = {};
  terms.forEach(term => {
    const idx = term.indexOf("=");
    if (idx > 0) {
      const param = term.substring(0, idx);
      const value = term.substring(idx + 1);
      queryParams[param] = value
    } else {
      queryParams[term] = true;
    }
  });

  const sessionId = queryParams["sessionId"] as string;
  const res = await fetch(`/api/minesweeper/sessions/${sessionId}`);
  if (res.status >= 400) {
    throw Error("Bad response");
  }
  const board = await res.json() as Board;
  return board;
}

export function LiveShareStage() {
  const [ cells, setCells ] = React.useState<JSX.Element[][]>([]);
  const [ name, setName ] = React.useState<string>("");
  const [ looser, setLooser ] = React.useState(false);

  function createCells(map: SharedMap, board: Board) {
    const cells: JSX.Element[][] = [];
    for (let r = 0; r < board.size.height; r++) {
      const row: JSX.Element[] = [];
      cells.push(row);
      for (let c = 0; c < board.size.width; c++) {
        const val = board.grid[r][c];
        row.push(<Cell count={val} displayed={false} hasBomb={val < 0} key={r * board.size.height + c} row={r} col={c} map={map} hasFlag={false}></Cell>);
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
    const board = await getBoardAsync();
    const container = await joinContainer();
    const map = container.initialObjects.val as SharedMap;
    const cells = createCells(map, board);
    setCells(cells);

    map.on("valueChanged", (val, isLocal) => {
      if (val.key === "looser") {
        setLooser(true);
      }
    });

    const context = await app.getContext();
    setName(context.user?.userPrincipalName || "UNKNOWN");
  }

  React.useEffect(() => {
    init().then();
  }, [setCells])

  return <div style={styles.default}>
    <Stack>
      <Stack.Item align="center"><h1>{ looser ? "You lost, you big looser!" : name }</h1></Stack.Item>
      <Stack.Item align="center">
        { cells.length ? cells.map(row => <div style={{display: "table-row"}}>{...row}</div>) : <Spinner label="Loading..." /> }
      </Stack.Item>
    </Stack>
  </div>
}