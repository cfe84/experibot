import { DefaultButton, Spinner, Stack, StackItem, TextField } from "@fluentui/react";
import { LiveShareClient } from "@microsoft/live-share";
import { app, LiveShareHost } from "@microsoft/teams-js";
import { SharedString, SharedMap } from "fluid-framework";
import { Cell } from "./Cell";
// yuk...
import { Board, generateBoard } from "./MineSweeperBoard";

import * as React from "react";
import { MineSweeperConsts } from "./MineSweeperConsts";

const styles = {
  default: {
    color: "white"
  },
  input: {
    width: "300px",
  }
}


const width = 25;
const height = 20;
const mines = Math.floor(width * height * .1);

const BOARD_KEY = "board";

function getBoard(map: SharedMap): Board {
  let board = map.get(BOARD_KEY)
  if (!board) {
    const grid = generateBoard(width, height, mines);
    board = {
      grid,
      size: {
        width,
        height
      },
      mines
    }
    map.set(BOARD_KEY, board);
  }
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
        const displayed = map.get(MineSweeperConsts.displayedKey(r, c)) === true;
        const hasFlag = map.get(MineSweeperConsts.flagKey(r, c)) === true;
        row.push(<Cell count={val} displayed={displayed} hasBomb={val < 0} key={r * board.size.height + c} row={r} col={c} map={map} hasFlag={hasFlag}></Cell>);
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
    const board: Board = getBoard(map);
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