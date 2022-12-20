import * as React from "react";
import { TextField, ComboBox, IDropdownOption, DefaultButton, Dropdown, Text } from "@fluentui/react";
import { app, pages } from "@microsoft/teams-js";

const targetPages = [
  { name: "Side panel", url: `${window.location.origin}/meetings/sidePanel/index.html?theme={theme}` },
  { name: "Live Share", url: `${window.location.origin}/meetings/liveShare/index.html?theme={theme}` },
];

const styles = {
  dropdown: {
    width: 300
  },
  input: {
    width: 300
  }
}

const options: IDropdownOption[] = Object.values(targetPages).map((page, i) => {
  return {
    key: i,
    text: page.name
  }
})

export function ConfigurationPage() {
  const [ name, setName ] = React.useState("Tab");
  const [ target, setTarget ] = React.useState(targetPages[0]);

  React.useEffect(() => {
    app.initialize()
    .then(app.getContext)
    .then((ctx) => {
        pages.config.registerOnSaveHandler((saveEvent) => {
          pages.config.setConfig({
            websiteUrl: `${window.location.origin}`,
            contentUrl: target.url,
            entityId: "grayIconTab",
            suggestedDisplayName: name
          });
          saveEvent.notifySuccess();
        });
        pages.config.setValidityState(true);
      });
  }, [target, name]);

  return <div>
    <h2>Configuration page for the meeting side panel</h2>
    <Text>You could configure the panel here.</Text>
    <Dropdown style={styles.dropdown} options={options} label="Page" defaultSelectedKey={0} onChange={(ev, opt, ctx) => setTarget(targetPages[opt?.key as number])}> </Dropdown>
    <TextField style={styles.input} value={name} onChange={e => setName(e.currentTarget.value)}></TextField>
  </div>
}