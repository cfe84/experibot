import * as React from "react";
import * as reactDom from "react-dom";

import { AuthenticationPage } from "./AuthenticationPage";

export function loadAuthenticatedTab(id: string) {
  window.onload = () => {
    const element = document.getElementById(id);
    if (!element) {
      console.error(`Element doesn't exist: '${id}'`)
      return
    }
    
    reactDom.render(<AuthenticationPage></AuthenticationPage>, element); 
  }
}