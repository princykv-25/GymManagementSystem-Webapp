const API_BASE = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", async () => {
  const session = JSON.parse(localStorage.getItem("gymUser") || "null");
  if (!session || session.role !== "trainer") {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("gymUser");
    window.location.href = "index.html";
  });

  const trainerId = session.user._id;
  bindTrainerProfileEditor(trainerId);
  await loadDashboard(trainerId);

  document.getElementById("attendanceForm").addEventListener("submit", (event) =>
    submitAttendance(event, trainerId)
  );
  document.getElementById("dietForm").addEventListener("submit", (event) =>
    submitDietPlan(event, trainerId)
  );
  document.getElementById("progressForm").addEventListener("submit", (event) =>
    submitProgress(event, trainerId)
  );
});

async function loadDashboard(trainerId) {
  const [trainer, members, attendance, dietPlans, progress] = await Promise.all([
    fetchJson(`${API_BASE}/trainers/${trainerId}`),
    fetchJson(`${API_BASE}/members?trainerId=${trainerId}`),
    fetchJson(`${API_BASE}/attendance`),
    fetchJson(`${API_BASE}/dietplans`),
    fetchJson(`${API_BASE}/progress`),
  ]);

  const trainerAttendance = attendance.filter((item) => item.trainer?._id === trainerId);
  const trainerDietPlans = dietPlans.filter((item) => item.trainer?._id === trainerId);
  const trainerProgress = progress.filter((item) => item.trainer?._id === trainerId);

  document.getElementById("trainerWelcome").textContent = `Welcome, ${trainer.name}`;
  document.getElementById("assignedCount").textContent = members.length;
  document.getElementById("attendanceMarked").textContent = trainerAttendance.length;
  document.getElementById("dietCreated").textContent = trainerDietPlans.length;
  document.getElementById("progressCreated").textContent = trainerProgress.length;

  renderTrainerProfile(trainer);
  renderAssignedMembers(members);
  populateMemberOptions(members);
  renderActivity(trainerAttendance, trainerDietPlans, trainerProgress);

  localStorage.setItem("gymUser", JSON.stringify({ role: "trainer", user: trainer }));
}

function renderTrainerProfile(trainer) {
  const specializationText = Array.isArray(trainer.specialization)
    ? trainer.specialization.join(", ")
    : trainer.specialization;

  document.getElementById("trainerProfile").innerHTML = `
    <div><span>Name</span><strong>${trainer.name}</strong></div>
    <div><span>Email</span><strong>${trainer.email}</strong></div>
    <div><span>Phone</span><strong>${trainer.phone}</strong></div>
    <div><span>Specialization</span><strong>${specializationText}</strong></div>
    <div><span>Experience</span><strong>${trainer.experience} years</strong></div>
    <div><span>Bio</span><strong>${trainer.bio || "Not added"}</strong></div>
  `;

  populateTrainerProfileForm(trainer);
}

function bindTrainerProfileEditor(trainerId) {
  const modal = document.getElementById("trainerProfileModal");
  const openBtn = document.getElementById("toggleTrainerProfileEditBtn");
  const closeBtn = document.getElementById("closeTrainerProfileModal");
  const form = document.getElementById("trainerProfileForm");
  if (!modal || !openBtn || !form) return;

  openBtn.addEventListener("click", () => modal.classList.remove("hidden-form"));
  closeBtn?.addEventListener("click", () => modal.classList.add("hidden-form"));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const specialization = Array.from(
      document.querySelectorAll('input[name="trainerEditSpecialization"]:checked')
    ).map((item) => item.value);

    if (!specialization.length) {
      showToast("Please select at least one specialization.", "error");
      return;
    }

    try {
      const data = await fetchJson(`${API_BASE}/trainers/${trainerId}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: document.getElementById("editTrainerName").value.trim(),
          phone: document.getElementById("editTrainerPhone").value.trim(),
          experience: Number(document.getElementById("editTrainerExperience").value),
          specialization,
          bio: document.getElementById("editTrainerBio").value.trim(),
        }),
      });

      localStorage.setItem("gymUser", JSON.stringify({ role: "trainer", user: data.trainer }));
      renderTrainerProfile(data.trainer);
      document.getElementById("trainerWelcome").textContent = `Welcome, ${data.trainer.name}`;
      modal.classList.add("hidden-form");
      showToast("Trainer profile updated successfully.", "success");
    } catch (error) {
      showToast(error.message || "Unable to update profile right now.", "error");
    }
  });
}

function populateTrainerProfileForm(trainer) {
  const form = document.getElementById("trainerProfileForm");
  if (!form) return;

  document.getElementById("editTrainerName").value = trainer.name || "";
  document.getElementById("editTrainerPhone").value = trainer.phone || "";
  document.getElementById("editTrainerExperience").value = trainer.experience || 0;
  document.getElementById("editTrainerBio").value = trainer.bio || "";

  document
    .querySelectorAll('input[name="trainerEditSpecialization"]')
    .forEach((checkbox) => {
      checkbox.checked = (trainer.specialization || []).includes(checkbox.value);
    });
}

function renderAssignedMembers(members) {
  const rows = document.getElementById("assignedMembersRows");
  rows.innerHTML = members.length
    ? members
        .map(
          (member) => `
            <tr>
              <td>${member.name}</td>
              <td>${member.email}</td>
              <td>${member.phone}</td>
              <td>${formatDate(member.joinDate)}</td>
            </tr>
          `
        )
        .join("")
    : `<tr><td colspan="4">No members assigned yet.</td></tr>`;
}

function populateMemberOptions(members) {
  const selects = [
    document.getElementById("attendanceMember"),
    document.getElementById("dietMember"),
    document.getElementById("progressMember"),
  ];

  selects.forEach((select) => {
    select.innerHTML = members.length
      ? `<option value="">Select Member</option>${members
          .map((member) => `<option value="${member._id}">${member.name}</option>`)
          .join("")}`
      : `<option value="">No assigned members</option>`;
  });
}

function renderActivity(attendance, dietPlans, progress) {
  const activity = [
    ...attendance.slice(-2).map((item) => ({
      title: `Attendance: ${item.member?.name || "Member"}`,
      detail: `${item.status} on ${formatDate(item.date)}`,
    })),
    ...dietPlans.slice(-2).map((item) => ({
      title: `Diet Plan: ${item.member?.name || "Member"}`,
      detail: `${item.goal} goal`,
    })),
    ...progress.slice(-2).map((item) => ({
      title: `Progress: ${item.member?.name || "Member"}`,
      detail: `${item.weight} kg, BMI ${item.bmi}`,
    })),
  ];

  document.getElementById("trainerActivity").innerHTML = activity.length
    ? activity
        .reverse()
        .map(
          (item) => `
            <article class="mini-card">
              <h3>${item.title}</h3>
              <p>${item.detail}</p>
            </article>
          `
        )
        .join("")
    : `<p class="empty-state">No recent activity yet.</p>`;
}

async function submitAttendance(event, trainerId) {
  event.preventDefault();
  await createRecord(`${API_BASE}/attendance/mark`, {
    member: document.getElementById("attendanceMember").value,
    trainer: trainerId,
    status: document.getElementById("attendanceStatus").value,
  });
}

async function submitDietPlan(event, trainerId) {
  event.preventDefault();
  await createRecord(`${API_BASE}/dietplans`, {
    member: document.getElementById("dietMember").value,
    trainer: trainerId,
    goal: document.getElementById("dietGoal").value,
    planDetails: document.getElementById("dietDetails").value.trim(),
  });
}

async function submitProgress(event, trainerId) {
  event.preventDefault();
  await createRecord(`${API_BASE}/progress`, {
    member: document.getElementById("progressMember").value,
    trainer: trainerId,
    weight: Number(document.getElementById("progressWeight").value),
    height: Number(document.getElementById("progressHeight").value),
    progressType: document.getElementById("progressType").value.trim(),
    notes: document.getElementById("progressNotes").value.trim(),
  });
}

async function createRecord(url, payload) {
  try {
    await fetchJson(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    showToast(getSuccessMessage(url), "success");
    setTimeout(() => {
      window.location.reload();
    }, 700);
  } catch (error) {
    showToast(error.message || "Request failed.", "error");
  }
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getSuccessMessage(url) {
  if (url.includes("/attendance/mark")) {
    return "Attendance saved successfully.";
  }

  if (url.includes("/dietplans")) {
    return "Diet plan created successfully.";
  }

  if (url.includes("/progress")) {
    return "Progress record added successfully.";
  }

  return "Saved successfully.";
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
