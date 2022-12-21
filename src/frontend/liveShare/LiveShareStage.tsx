import { DefaultButton, Spinner, Stack, StackItem, TextField } from "@fluentui/react";
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
const height = 20;
const mines = Math.floor(width * height * .1);

function generateBoard(mines: number) {
  if (mines > width * height) {
    mines = width * height;
  }
  const board: number[][] = [];
  for (let row = 0; row < height; row++) {
    const r: number[] = [];
    board.push(r);
    for (let col = 0; col < width; col++) {
      r.push(0);
    }
  }

  for (let i = 0; i < mines; i++) {
    while(true) {
      const row = Math.floor(Math.random() * height);
      const col = Math.floor(Math.random() * width);
      if (!board[row][col]) {
        board[row][col] = -1;
        break;
      }
    }
  }

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      if (board[row][col] === -1) {
        continue;
      }
      const count = [-1, 0, 1].reduce((curr, r) => curr + [-1, 0, 1].reduce((curr, c) => {
        if (c === 0 && r === 0) {
          return curr
        }
        const colBeingChecked = c + col;
        const rowBeingChecked = r + row;
        if (colBeingChecked < 0 || colBeingChecked >= width || rowBeingChecked < 0 || rowBeingChecked >= height) {
          return curr;
        }
        const hasBomb = board[rowBeingChecked][colBeingChecked] === -1;
        return hasBomb ? curr + 1 : curr;
      }, 0), 0);
      board[row][col] = count;
    }
  }
  return board;
}

export function LiveShareStage() {
  const [ cells, setCells ] = React.useState<JSX.Element[][]>([]);
  const [ name, setName ] = React.useState<string>("");
  const [ looser, setLooser ] = React.useState(false);
  const board = React.useMemo(() => generateBoard(mines), []);

  function createCells(map: SharedMap) {
    const cells: JSX.Element[][] = [];
    for (let r = 0; r < height; r++) {
      const row: JSX.Element[] = [];
      cells.push(row);
      for (let c = 0; c < width; c++) {
        const val = board[r][c];
        row.push(<Cell count={val} displayed={false} hasBomb={val < 0} key={r * height + c} row={r} col={c} map={map} hasFlag={false}></Cell>);
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