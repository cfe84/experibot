import * as React from "react";
import * as reactDom from "react-dom";

import { RecordConfiguration } from "./RecordConfiguration";

export function loadAuthenticatedTaskModule(id: string) {
  window.onload = () => {
    const element = document.getElementById(id);
    if (!element) {
      console.error(`Element doesn't exist: '${id}'`)
      return
    }
    
    reactDom.render(<RecordConfiguration></RecordConfiguration>, element); 
  }
}