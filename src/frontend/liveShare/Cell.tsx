import * as React from "react"
import { SharedMap } from "fluid-framework";

const styles = {
  
}

export interface CellProps {
  displayed: boolean,
  row: number,
  col: number,
  map: SharedMap,
  hasBomb: boolean,
  hasFlag: boolean,
  count: number
}
const DISPLAYED_KEY = "displayed";
const VALUE_KEY = "value";
const FLAG_KEY = "flag";
const LOOSER_KEY = "looser";
const BOMB = -1;
const FLAG = -2;

export function Cell(props: CellProps) {
  const [ isDisplayed, setDisplayed ] = React.useState(props.displayed);
  const [ hasBomb, setHasBomb ] = React.useState(props.hasBomb);
  const [ count, setCount ] = React.useState(props.count);
  const [ hasFlag, setHasFlag ] = React.useState(props.hasFlag);

  const displayedKey = React.useMemo(() => `${DISPLAYED_KEY}-${props.row}-${props.col}`, [])
  const valueKey = React.useMemo(() => `${VALUE_KEY}-${props.row}-${props.col}`, [])
  const flagKey = React.useMemo(() => `${FLAG_KEY}-${props.row}-${props.col}`, [])
  const color = React.useMemo(() => {
    const colors = ["#ccf1ff", "#e0d7ff", "#ffcce1", "#d7eeff", "#faffc7"];
    return colors[Math.floor(Math.random() * colors.length)]
  }, []);
  
  React.useEffect(() => {
    props.map.on("valueChanged", (val, isLocal) => {
      if (!isLocal && val.key === displayedKey){
        setDisplayed(props.map.get(displayedKey) === `${true}`);
      }
      if (!isLocal && val.key === valueKey){
        const value = Number.parseInt(props.map.get(valueKey) || "0");
        if (value >= 0 && value <= 8) {
          setCount(value);
        } else if (value === BOMB) {
          setHasBomb(true)
        }
      }
      if (!isLocal && val.key === flagKey) {
        setHasFlag(props.map.get(flagKey) === `${true}`)
      }
    });
  }, [setDisplayed, setCount, setHasBomb]);

  function onClick(ev: React.MouseEvent<HTMLDivElement>) {
    if (ev.button === 0) { // left click
      setDisplayed(true);
      props.map.set(displayedKey, `${true}`);
      if (hasBomb) {
        props.map.set(LOOSER_KEY, `${true}`);
      }
    } else { // right click
      console.log(`Right click`);
      props.map.set(flagKey, `${!hasFlag}`);
      setHasFlag(!hasFlag);
      ev.preventDefault();
    }
  }

  return <div id={valueKey} key={valueKey} style={{
    display: "table-cell",
    width: "25px",
    height: "25px",
    border: "1pt solid grey",
    textAlign: "center",
    verticalAlign: "middle",
    color: "black",
    background: isDisplayed ? hasBomb ? "red" : color : "dark gray",
  }} onClick={onClick} onContextMenu={onClick}>{isDisplayed ? hasBomb ? "💣" : count > 0 ? count : " " : hasFlag ? "🚩" : " "}</div>
}