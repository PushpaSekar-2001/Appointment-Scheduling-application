/* ================= DATA ================= */
let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

/* ================= ELEMENTS ================= */
const hospitalName = document.getElementById("hospitalName");
const specialtyInput = document.getElementById("specialty"); // Make sure HTML input id="specialty"
const calendarGrid = document.getElementById("calendarGrid");
const monthYear = document.getElementById("monthYear");

const calendarBtn = document.getElementById("calendarBtn");
const dashboardBtn = document.getElementById("dashboardBtn");
const calendarSection = document.getElementById("calendarSection");
const dashboardSection = document.getElementById("dashboardSection");
const pageTitle = document.getElementById("pageTitle");

const modal = document.getElementById("modal");
const openModalBtn = document.getElementById("openModalBtn");
const saveBtn = document.getElementById("saveBtn");

const patientName = document.getElementById("patientName");
const doctorName = document.getElementById("doctorName");
const appointmentDate = document.getElementById("appointmentDate");
const appointmentTime = document.getElementById("appointmentTime");

/* ================= SIDEBAR ================= */
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("show");
}

/* ================= NAVIGATION ================= */
calendarBtn.onclick = () => {
  calendarSection.style.display = "block";
  dashboardSection.style.display = "none";
  pageTitle.innerText = "Appointment Scheduling";
  calendarBtn.classList.add("active");
  dashboardBtn.classList.remove("active");
};

dashboardBtn.onclick = () => {
  calendarSection.style.display = "none";
  dashboardSection.style.display = "block";
  pageTitle.innerText = "Appointment Details Page";
  dashboardBtn.classList.add("active");
  calendarBtn.classList.remove("active");
  renderDashboard();
};

/* ================= MODAL ================= */
openModalBtn.onclick = () => (modal.style.display = "flex");
function closeModal() {
  modal.style.display = "none";
}

/* ================= MONTH NAME ================= */
function getMonthName(month) {
  return new Date(2025, month).toLocaleString("default", { month: "long" });
}

/* ================= CALENDAR ================= */
function generateCalendar(month, year, appts = appointments) {
  calendarGrid.innerHTML = "";
  monthYear.innerText = `${getMonthName(month)} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Empty cells
  for (let i = 0; i < firstDay; i++) {
    calendarGrid.appendChild(document.createElement("div"));
  }

  // Dates
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const cell = document.createElement("div");
    cell.className = "date-cell";
    cell.innerHTML = `<strong>${day}</strong>`;

    const booked = appts.filter((a) => a.date === dateStr);
    if (booked.length > 0) {
      booked.forEach(appt => {
        const item = document.createElement("div");
        item.className = "booked-bar";
        item.innerHTML = `
          <strong>${appt.patient}</strong><br>
          ${appt.doctor}<br>
          ⏰ ${appt.time}
        `;
        cell.appendChild(item);
      });
    }

    calendarGrid.appendChild(cell);
  }
}

/* ================= MONTH ARROWS ================= */
document.getElementById("prevMonth").onclick = () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  generateCalendar(currentMonth, currentYear);
};

document.getElementById("nextMonth").onclick = () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  generateCalendar(currentMonth, currentYear);
};

/* ================= DASHBOARD ================= */
function renderDashboard() {
  const tbody = document.getElementById("appointmentTableBody");
  if (!tbody) return;

  const patientFilter = document.getElementById("searchPatient").value.toLowerCase();
  const doctorFilter = document.getElementById("searchDoctor").value.toLowerCase();
  const fromDate = document.getElementById("fromDate").value;
  const toDate = document.getElementById("toDate")?.value || "";

  tbody.innerHTML = "";

  const filtered = appointments.filter(a => {
    const patientMatch = a.patient.toLowerCase().includes(patientFilter);
    const doctorMatch = a.doctor.toLowerCase().includes(doctorFilter);

    let dateMatch = true;
    if (fromDate && toDate) {
      dateMatch = a.date >= fromDate && a.date <= toDate;
    } else if (fromDate) {
      dateMatch = a.date >= fromDate;
    } else if (toDate) {
      dateMatch = a.date <= toDate;
    }

    return patientMatch && doctorMatch && dateMatch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7">No appointments found</td></tr>`;
  } else {
    filtered.forEach((a, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${a.patient}</td>
        <td>${a.doctor}</td>
        <td>${a.hospital}</td>
        <td>${a.specialty}</td>
        <td>${a.date}</td>
        <td>${a.time}</td>
        <td>
          <button class="action-btn edit" onclick="editAppt(${index})">✏️</button>
          <button class="action-btn delete" onclick="deleteAppt(${index})">🗑</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  // Update calendar with filtered appointments
  generateCalendar(currentMonth, currentYear, filtered);
}

/* ================= DELETE ================= */
function deleteAppt(index) {
  appointments.splice(index, 1);
  localStorage.setItem("appointments", JSON.stringify(appointments));
  renderDashboard();
}

/* ================= EDIT ================= */
function editAppt(i) {
  const a = appointments[i];
  patientName.value = a.patient;
  doctorName.value = a.doctor;
  hospitalName.value = a.hospital;
  specialtyInput.value = a.specialty;
  appointmentDate.value = a.date;
  appointmentTime.value = a.time;

  appointments.splice(i, 1);
  localStorage.setItem("appointments", JSON.stringify(appointments));
  modal.style.display = "flex";
}

/* ================= SAVE ================= */
saveBtn.onclick = () => {
  const patient = patientName.value.trim();
  const doctor = doctorName.value.trim();
  const hospital = hospitalName.value.trim();
  const specialtyValue = specialtyInput.value.trim();
  const date = appointmentDate.value;
  const time = appointmentTime.value;

  if (!patient || !doctor || !hospital || !specialtyValue || !date || !time) {
    alert("Fill all required fields");
    return;
  }

  appointments.push({ patient, doctor, hospital, specialty: specialtyValue, date, time });
  localStorage.setItem("appointments", JSON.stringify(appointments));

  // Clear form
  patientName.value = "";
  doctorName.value = "";
  hospitalName.value = "";
  specialtyInput.value = "";
  appointmentDate.value = "";
  appointmentTime.value = "";

  closeModal();
  showToast();
  renderDashboard(); // Automatically updates table & calendar

  alert("Appointment successfully submitted ✅");
};

/* ================= TOAST ================= */
function showToast() {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}

/* ================= FILTER BUTTON ================= */


document.getElementById("updateBtn").addEventListener("click", () => {
  renderDashboard();
});

document.getElementById("searchPatient").addEventListener("input", renderDashboard);
document.getElementById("searchDoctor").addEventListener("input", renderDashboard);
document.getElementById("fromDate").addEventListener("change", renderDashboard);
document.getElementById("updateBtn").addEventListener("click", renderDashboard);
/* ================= INIT ================= */
generateCalendar(currentMonth, currentYear);
renderDashboard();


function toggleSidebar() {
  document.querySelector(".sidebar").classList.toggle("show");
}

