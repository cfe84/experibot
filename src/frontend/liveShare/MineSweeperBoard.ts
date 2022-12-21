
export type Grid = number[][];
export interface Board {
  grid: Grid,
  size: {
    width: number,
    height: number,
  },
  mines: number
}

export function generateBoard(width: number, height: number, mines: number) {
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