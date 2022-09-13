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

  // Trying to change title to check if it can be forged
  const attachTitleBtn = () => {
    const changeTitleBtn = document.getElementById("change-title-btn")
    changeTitleBtn.onclick = () => {
      document.title = "Another title"
    }
  }

  window.onload = () => {
    microsoftTeams.initialize(() => {
    });
    attachCloseButton();
    attachTitleBtn();
  }
})()
