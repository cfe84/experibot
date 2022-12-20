import * as React from "react";
import * as reactDom from "react-dom";

import { ConfigurationPage } from "./ConfigurationPage";

export function loadConfigurationPage(id: string) {
  window.onload = () => {
    const element = document.getElementById(id);
    if (!element) {
      console.error(`Element doesn't exist: '${id}'`)
      return
    }
    reactDom.render(<ConfigurationPage></ConfigurationPage>, element); 
  }
}