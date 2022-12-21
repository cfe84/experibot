const DISPLAYED_KEY = "displayed";
const VALUE_KEY = "value";
const FLAG_KEY = "flag";

export const MineSweeperConsts = {
  board: "board",
  displayedKey: (row: number, col: number) => `${DISPLAYED_KEY}-${row}-${col}`,
  valueKey: (row: number, col: number) => `${VALUE_KEY}-${row}-${col}`,
  flagKey: (row: number, col: number) => `${FLAG_KEY}-${row}-${col}`
}