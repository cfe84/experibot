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

  function displayAppointments(appointments) {
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

    const appointmentsListElt = appointments.sort((a, b) => a.date.localeCompare(b.date)).map(appointment => {
      const date = DateTime.fromISO(appointment.date)
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
      displayAppointments(appointments)
    })
  }

  window.onload = () => {
    refreshAppointments()
    plugButtons()
  }
})()
