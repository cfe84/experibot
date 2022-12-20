import * as React from "react";
import * as reactDom from "react-dom";
import { app } from "@microsoft/teams-js";
import { LiveSharePanel } from "./LiveSharePanel";
import { LiveShareStage } from "./LiveShareStage";


async function load(id: string) {
  const element = document.getElementById(id);
  if (!element) {
    console.error(`Element doesn't exist: '${id}'`)
    return
  }
  reactDom.render(<LiveSharePanel></LiveSharePanel>, element); 

  // Join the Fluid container
  await app.initialize();

}

// ... ready to start app sync logic
export function loadLiveSharePanel(id: string) {
  window.onload = () => {
    load(id).then()
  }
}

export function loadLiveShareStage(id: string) {
  window.onload = () => {
    const element = document.getElementById(id);
    if (!element) {
      console.error(`Element doesn't exist: '${id}'`)
      return
    }
    reactDom.render(<LiveShareStage></LiveShareStage>, element); 
  }
}