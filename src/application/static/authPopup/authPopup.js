import { getQueryParameters } from "../common/utils.js"

(function () {
  const queryParameters = getQueryParameters()
  if (queryParameters && queryParameters.redirectUrl) {
    window.location.assign(queryParameters.redirectUrl)
  }

  const attachCloseButton = () => {
    const closeBtn = document.getElementById("close");
    const callbackInput = document.getElementById("input-callback");
    const pre = document.getElementById("pre-sample")
    closeBtn.onclick = () => {
      microsoftTeams.authentication.notifySuccess(callbackInput.value);
    };
    callbackInput.onkeyup = () => {
      const value = callbackInput.value
      const sample = `microsoftTeams.authentication.notifySuccess("${value}");`
      pre.innerText = sample
    }
  };

  window.onload = () => {
    microsoftTeams.initialize(() => {
    });
    attachCloseButton();
  }
})()
