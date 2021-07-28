import { callBackendAsync, createElement } from "../common/utils.js"
import { DateTime } from "../common/luxon.min.js"

async function getAppointmentsAsync() {
  return await callBackendAsync("GET", "/api/appointments")
}

function displayAppointments(appointments) {
  const appointmentsElt = document.getElementById("appointments")
  appointmentsElt.innerHTML = ""
  const header = {
    elt: "tr",
    parent: appointmentsElt,
    children: ["Date", "Time", "Title", "Service type", ""].map(content => ({
      elt: "th",
      attributes: { className: "table-column" },
      content
    }))
  }
  createElement(header)

  const appointmentsListElt = appointments.map(appointment => {
    const date = new DateTime(appointment.date)
    const row = {
      elt: "tr",
      parent: appointmentsElt,
      children: [
        { elt: "td", content: `${date.toLocaleString({ month: 'long', day: 'numeric' })}` },
        { elt: "td", content: date.toLocaleString(DateTime.TIME_SIMPLE) },
        { elt: "td", content: appointment.title },
        { elt: "td", content: appointment.serviceType },
        {
          elt: "td", children: [
            {
              elt: "button",
              attributes: { className: "button-secondary" },
              content: "Update"
            }
          ]
        },
      ]
    }
    return row
  })
  createElement(appointmentsListElt)
}

window.onload = () => {
  getAppointmentsAsync().then((appointmentsAsString) => {
    const appointments = JSON.parse(appointmentsAsString)
    displayAppointments(appointments)
  })
}