const API_BASE = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", async () => {
  const session = JSON.parse(localStorage.getItem("gymUser") || "null");
  if (!session || session.role !== "admin") {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("gymUser");
    window.location.href = "index.html";
  });

  await Promise.all([loadCounts(), loadRecentMembers(), loadUnassignedMembers()]);
  renderChart();
});

async function loadCounts() {
  const [members, trainers, attendance, dietPlans, progress] = await Promise.all([
    fetchJson(`${API_BASE}/members/count`),
    fetchJson(`${API_BASE}/trainers/count`),
    fetchJson(`${API_BASE}/attendance/count`),
    fetchJson(`${API_BASE}/dietplans/count`),
    fetchJson(`${API_BASE}/progress/count`),
  ]);

  document.getElementById("membersCount").textContent = members.count || 0;
  document.getElementById("trainersCount").textContent = trainers.count || 0;
  document.getElementById("attendanceCount").textContent = attendance.count || 0;
  document.getElementById("dietCount").textContent = dietPlans.count || 0;
  document.getElementById("progressCount").textContent = progress.count || 0;
}

async function loadRecentMembers() {
  const members = await fetchJson(`${API_BASE}/members/latest`);
  const list = document.getElementById("recentMembers");

  list.innerHTML = members.length
    ? members
        .map(
          (member) =>
            `<li><strong>${member.name}</strong><span>${member.email}</span><span>${member.trainer?.name || "No trainer assigned"}</span></li>`
        )
        .join("")
    : `<li>No members found yet.</li>`;
}

async function loadUnassignedMembers() {
  const [members, trainers] = await Promise.all([
    fetchJson(`${API_BASE}/members/unassigned`),
    fetchJson(`${API_BASE}/trainers`),
  ]);
  const container = document.getElementById("unassignedMembers");

  if (!members.length) {
    container.innerHTML = `<p class="empty-state">All members are already assigned.</p>`;
    return;
  }

  container.innerHTML = members
    .map(
      (member) => `
        <div class="action-item">
          <div>
            <strong>${member.name}</strong>
            <p>${member.email}</p>
          </div>
          <div class="inline-form">
            <select id="trainerSelect-${member._id}">
              <option value="">Select Trainer</option>
              ${trainers.map((trainer) => `<option value="${trainer._id}">${trainer.name}</option>`).join("")}
            </select>
            <button type="button" onclick="assignTrainer('${member._id}')">Assign</button>
          </div>
        </div>
      `
    )
    .join("");
}

async function assignTrainer(memberId) {
  const trainerId = document.getElementById(`trainerSelect-${memberId}`).value;
  if (!trainerId) {
    showToast("Please select a trainer before assigning.", "error");
    return;
  }

  try {
    await fetchJson(`${API_BASE}/members/${memberId}/assign-trainer/${trainerId}`, {
      method: "PUT",
    });
    await Promise.all([loadRecentMembers(), loadUnassignedMembers()]);
    showToast("Trainer assigned successfully.", "success");
  } catch (error) {
    showToast(error.message || "Unable to assign trainer right now.", "error");
  }
}

function renderChart() {
  const canvas = document.getElementById("adminChart");
  new Chart(canvas, {
    type: "bar",
    data: {
      labels: ["Members", "Trainers", "Attendance", "Diet Plans", "Progress"],
      datasets: [
        {
          label: "Gym Data",
          data: [
            Number(document.getElementById("membersCount").textContent),
            Number(document.getElementById("trainersCount").textContent),
            Number(document.getElementById("attendanceCount").textContent),
            Number(document.getElementById("dietCount").textContent),
            Number(document.getElementById("progressCount").textContent),
          ],
          backgroundColor: ["#ff7a18", "#ff9f1c", "#ffbf69", "#ffd166", "#ffe29a"],
          borderRadius: 10,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#d7dbdf" } },
        y: { ticks: { color: "#d7dbdf" } },
      },
    },
  });
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 50);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}
