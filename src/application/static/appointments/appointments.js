import { callBackendAsync } from "../common/utils.js"

async function getAppointmentsAsync() {
  return await callBackendAsync("GET", "/api/appointments")
}

window.onload = () => {
  getAppointmentsAsync().then(() => {})
}