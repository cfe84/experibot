import {loadAuthenticatedTab} from "./authenticatedTab/index";
import { loadAuthenticatedTaskModule } from "./authenticatedTaskModule";
import { loadLiveSharePanel, loadLiveShareStage } from "./liveShare";
import { loadConfigurationPage } from "./sidePanel";

const features: {[featureName: string]: any} = {
  loadAuthenticatedTab,
  loadAuthenticatedTaskModule,
  loadConfigurationPage,
  loadLiveSharePanel,
  loadLiveShareStage,
};

Object.keys(features).forEach(featureName => {
  (window as any)[featureName] = features[featureName];
});