import { callBackendAsync, createElement } from "../common/utils.js"
import { DateTime } from "../common/luxon.min.js"

(function () {

  const createButton = document.getElementById("btn-create")
  const appointmentsElt = document.getElementById("appointments")
  const formTitleInput = document.getElementById("form-title")
  const formDateInput = document.getElementById("form-date")
  const formParticipantsInput = document.getElementById("form-participants")
  const formServiceTypeSelect = document.getElementById("form-service-type")
  const formSaveButton = document.getElementById("modal-btn-save")
  const formCancelButton = document.getElementById("modal-btn-cancel")
  const modal = document.getElementById("modal")

  async function getAppointmentsAsync() {
    return await callBackendAsync("GET", "/api/appointments")
  }

  async function createMeetingAsync(date, subject) {
    const body = {
      "startDateTime": date.toISOString(),
      "endDateTime": date.plus({ hours: 1 }).toISOString(),
      "subject": subject,
      "lobbyBypassSettings": {
        "scope": "organization",
        "isDialInBypassEnabled": false
      }
    }
    const meeting = await callBackendAsync(
      "POST",
      "https://graph.microsoft.com/v1.0/me/onlineMeetings",
      body,
      {
        "content-type": "application/json"
      })
    console.log(JSON.stringify(meeting, null, 2))
    return meeting
  }

  function displayAppointments(appointments, parent) {
    const appointmentsListElt = appointments.map(appointment => {
      const date = DateTime.fromISO(appointment.date)
      const row = {
        elt: "tr",
        parent,
        children: [
          { elt: "td" },
          { elt: "td", content: date.toLocaleString(DateTime.TIME_SIMPLE) },
          { elt: "td", content: appointment.title },
          { elt: "td", content: appointment.serviceType },
          {
            elt: "td", children: [
              {
                elt: "button",
                attributes: {
                  className: "button-secondary", onclick: () => {
                    showModal(appointment)
                  }
                },
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

  function loadAllAppointments(appointments) {
    appointments = appointments.sort((a, b) => a.date.localeCompare(b.date))
    const dates = appointments
      .map(apt => DateTime.fromISO(apt.date).toLocaleString({ month: 'long', day: 'numeric' }))
      .filter((v, i, a) => a.indexOf(v) === i)
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
    // createElement(header)
    dates.forEach(d => {
      createElement({
        elt: "tr",
        parent: appointmentsElt,
        children: [
          {
            elt: "td",
            attributes: {
              className: "font-title2",
              colspan: 5
            },
            content: d
          }
        ]
      })
      const appointmentsOnThisDate = appointments
        .filter(apt => DateTime.fromISO(apt.date).toLocaleString({ month: 'long', day: 'numeric' }) === d)
      displayAppointments(appointmentsOnThisDate, appointmentsElt)
    })

    // displayAppointments(appointments, appointmentsElt)
  }

  const setModalVisibility = (visible) => {
    modal.style.display = visible ? "block" : "none"
  }

  const updateServiceTypesAsync = async (selectedId) => {
    const typesAsString = await callBackendAsync("GET", "/api/serviceTypes/")
    const types = JSON.parse(typesAsString)
    types.sort((a, b) => a.name.localeCompare(b.name)).forEach(type => {
      createElement({
        elt: "option",
        parent: formServiceTypeSelect,
        content: `${type.name} ($${type.price})`,
        attributes: {
          value: type.id,
          selected: type.id === selectedId
        }
      })
    })
  }

  const saveAppointment = (appointmentId) => {
    console.log(appointmentId)
    const appointment = {
      id: appointmentId,
      title: formTitleInput.value,
      date: formDateInput.value,
      serviceTypeId: formServiceTypeSelect.value
    }
    callBackendAsync("POST", "/api/appointments/", JSON.stringify(appointment), "application/json")
      .then(() => {
        setModalVisibility(false)
        refreshAppointments()
      })
  }

  const showModal = (appointment) => {
    formTitleInput.value = appointment.title || ""
    formDateInput.value = appointment.date || (new Date()).toISOString()
    formParticipantsInput.value = ""
    formServiceTypeSelect.innerHTML = ""
    updateServiceTypesAsync(appointment.serviceTypeId).then(() => {

    })
    setModalVisibility(true)
    formSaveButton.onclick = () => saveAppointment(appointment.id)
  }

  const plugButtons = () => {
    createButton.onclick = () => {
      showModal({})
    }
    formCancelButton.onclick = () => {
      setModalVisibility(false)
    }
    formServiceTypeSelect.onselectionchange = () => {
      formTitleInput.value = formServiceTypeSelect.selectedId
    }
  }

  const refreshAppointments = () => {
    getAppointmentsAsync().then((appointmentsAsString) => {
      const appointments = JSON.parse(appointmentsAsString)
      loadAllAppointments(appointments)
    })
  }

  window.onload = () => {
    refreshAppointments()
    plugButtons()
  }
})()
