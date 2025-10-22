import { Chart } from "@/components/ui/chart"
// Real-time Date and Time Display
function updateDateTime() {
  const now = new Date()

  // Update time
  const hours = String(now.getHours()).padStart(2, "0")
  const minutes = String(now.getMinutes()).padStart(2, "0")
  const seconds = String(now.getSeconds()).padStart(2, "0")
  document.getElementById("timeDisplay").textContent = `${hours}:${minutes}:${seconds}`

  // Update date
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  const dateStr = now.toLocaleDateString("en-US", options)
  document.getElementById("dateDisplay").textContent = dateStr
}

// Initialize date/time on load and update every second
updateDateTime()
setInterval(updateDateTime, 1000)

// Set minimum date to today
document.getElementById("medicineDate").min = new Date().toISOString().split("T")[0]

// Temperature Chart
let tempChart = null
const tempData = []
const tempLabels = []

function initTemperatureChart() {
  const ctx = document.getElementById("tempChart").getContext("2d")
  tempChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: tempLabels,
      datasets: [
        {
          label: "Temperature (°C)",
          data: tempData,
          borderColor: "#0dcaf0",
          backgroundColor: "rgba(13, 202, 240, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: "#0dcaf0",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          min: 15,
          max: 35,
          ticks: {
            callback: (value) => value + "°C",
          },
        },
      },
    },
  })
}

// Fetch sensor data from backend
async function fetchSensorData() {
  try {
    const response = await fetch("api/get-sensor-data.php")
    const data = await response.json()

    if (data.success) {
      updateTemperatureDisplay(data.temperature)
      updateStockDisplay(data.stock_level, data.slots_detected)
    }
  } catch (error) {
    console.error("Error fetching sensor data:", error)
  }
}

function updateTemperatureDisplay(temperature) {
  const tempValue = Number.parseFloat(temperature)
  document.getElementById("tempValue").textContent = tempValue.toFixed(1) + "°C"

  // Update status based on temperature
  let status = "Normal"
  if (tempValue < 18) status = "Cold"
  else if (tempValue > 28) status = "Hot"
  document.getElementById("tempStatus").textContent = status

  // Update chart
  const now = new Date()
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })

  tempLabels.push(timeStr)
  tempData.push(tempValue)

  // Keep only last 20 data points
  if (tempLabels.length > 20) {
    tempLabels.shift()
    tempData.shift()
  }

  if (tempChart) {
    tempChart.update()
  }

  // Update last updated time
  document.getElementById("tempUpdated").textContent = `Last updated: ${timeStr}`
}

function updateStockDisplay(stockLevel, slotsDetected) {
  const stockFill = document.getElementById("stockFill")
  const stockLabel = document.getElementById("stockLabel")
  const slotsElement = document.getElementById("slotsDetected")

  const percentage = (slotsDetected / 10) * 100
  stockFill.style.width = percentage + "%"
  slotsElement.textContent = slotsDetected

  // Update status and color
  stockFill.classList.remove("high", "medium", "low")
  if (stockLevel === "high") {
    stockLabel.textContent = "✓ Stock: HIGH"
    stockLabel.style.color = "#198754"
    stockFill.classList.add("high")
  } else if (stockLevel === "medium") {
    stockLabel.textContent = "⚠ Stock: MEDIUM"
    stockLabel.style.color = "#ffc107"
    stockFill.classList.add("medium")
  } else {
    stockLabel.textContent = "✗ Stock: LOW"
    stockLabel.style.color = "#dc3545"
    stockFill.classList.add("low")
  }

  // Update last updated time
  const now = new Date()
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  document.getElementById("stockUpdated").textContent = `Last updated: ${timeStr}`
}

// Notification System
function showNotification(message, type = "info") {
  const notificationArea = document.getElementById("notificationArea")
  const notification = document.createElement("div")
  notification.className = `notification ${type}`

  const icon = {
    success: '<i class="bi bi-check-circle"></i>',
    warning: '<i class="bi bi-exclamation-triangle"></i>',
    danger: '<i class="bi bi-x-circle"></i>',
    info: '<i class="bi bi-info-circle"></i>',
  }

  notification.innerHTML = `${icon[type]} <span>${message}</span>`
  notificationArea.appendChild(notification)

  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = "slideInRight 0.3s ease-out reverse"
    setTimeout(() => notification.remove(), 300)
  }, 5000)
}

// Reminder Management
let reminders = []

function loadReminders() {
  fetch("api/get-reminders.php")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        reminders = data.reminders
        displayReminders()
      }
    })
    .catch((error) => console.error("Error loading reminders:", error))
}

function displayReminders() {
  const remindersList = document.getElementById("remindersList")

  if (reminders.length === 0) {
    remindersList.innerHTML = '<p class="text-muted">No reminders scheduled yet.</p>'
    return
  }

  remindersList.innerHTML = reminders
    .map(
      (reminder) => `
        <div class="reminder-card ${reminder.status}">
            <div class="reminder-medicine">${reminder.medicine_name}</div>
            <div class="reminder-time">
                <i class="bi bi-calendar-event"></i> ${reminder.date} at ${reminder.time}
            </div>
            <div class="reminder-note">${reminder.note || "No notes"}</div>
            <span class="reminder-status ${reminder.status}">
                ${reminder.status.charAt(0).toUpperCase() + reminder.status.slice(1)}
            </span>
            <button class="btn btn-sm btn-outline-danger ms-2" onclick="deleteReminder(${reminder.id})">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `,
    )
    .join("")
}

// Add new reminder
document.getElementById("reminderForm").addEventListener("submit", async (e) => {
  e.preventDefault()

  const formData = new FormData()
  formData.append("medicine_name", document.getElementById("medicineName").value)
  formData.append("date", document.getElementById("medicineDate").value)
  formData.append("time", document.getElementById("medicineTime").value)
  formData.append("note", document.getElementById("medicineNote").value)

  try {
    const response = await fetch("api/add-reminder.php", {
      method: "POST",
      body: formData,
    })

    const data = await response.json()

    if (data.success) {
      showNotification("Reminder added successfully!", "success")
      document.getElementById("reminderForm").reset()
      loadReminders()
    } else {
      showNotification("Error adding reminder: " + data.message, "danger")
    }
  } catch (error) {
    console.error("Error adding reminder:", error)
    showNotification("Error adding reminder", "danger")
  }
})

function deleteReminder(id) {
  if (confirm("Are you sure you want to delete this reminder?")) {
    fetch(`api/delete-reminder.php?id=${id}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          showNotification("Reminder deleted", "success")
          loadReminders()
        }
      })
      .catch((error) => console.error("Error deleting reminder:", error))
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  initTemperatureChart()
  loadReminders()

  // Fetch sensor data every 5 seconds
  fetchSensorData()
  setInterval(fetchSensorData, 5000)

  // Check for upcoming reminders every minute
  checkUpcomingReminders()
  setInterval(checkUpcomingReminders, 60000)
})

function checkUpcomingReminders() {
  const now = new Date()
  reminders.forEach((reminder) => {
    const reminderTime = new Date(`${reminder.date}T${reminder.time}`)
    const timeDiff = reminderTime - now

    // Alert 5 minutes before
    if (timeDiff > 0 && timeDiff < 300000 && reminder.status === "pending") {
      showNotification(`Reminder: Take ${reminder.medicine_name} in 5 minutes!`, "warning")
    }
  })
}
