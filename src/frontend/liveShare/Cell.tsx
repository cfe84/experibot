import * as React from "react"
import { SharedString, SharedMap } from "fluid-framework";

const styles = {
  
}

export interface CellProps {
  color: string,
  row: number,
  col: number,
  map: SharedMap
}
const VAL_KEY = "cell";

export function Cell(props: CellProps) {
  const [color, setColor] = React.useState(props.color);
  const [text, setText] = React.useState("");

  const key = React.useMemo(() => `${VAL_KEY}-${props.row}-${props.col}`, [])
  
  React.useEffect(() => {
    props.map.on("valueChanged", (val, isLocal) => {
      if (!isLocal && val.key === key){
        setColor(props.map.get(key) || "red");
      }
    });
  }, [setColor, color])

  function onClick() {
    const colors = ["#ccf1ff", "#e0d7ff", "#ffcce1", "#d7eeff", "#faffc7"];
    const newColor = colors[Math.floor(Math.random() * colors.length)];
    setColor(newColor);
    props.map.set(key, newColor);
  }

  return <div style={{
    display: "inline-block",
    width: "20px",
    height: "20px",
    border: "1pt solid grey",
    background: color
  }} onClick={onClick}>{text}
  </div>
}