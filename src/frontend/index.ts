import {loadAuthenticatedTab} from "./authenticatedTab/index";
import { loadAuthenticatedTaskModule } from "./authenticatedTaskModule";

const features: {[featureName: string]: any} = {
  loadAuthenticatedTab,
  loadAuthenticatedTaskModule
};

Object.keys(features).forEach(featureName => {
  (window as any)[featureName] = features[featureName];
});