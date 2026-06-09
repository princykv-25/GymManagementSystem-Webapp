const API_BASE = "http://localhost:5000/api";
let memberProgressChart = null;

document.addEventListener("DOMContentLoaded", () => {
  setupLogin();
  setupResetPassword();
  setupTrainerResetPassword();
  setupMemberDashboard();
});

function setupLogin() {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) {
    return;
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const role = document.getElementById("role").value;
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const endpointMap = {
      admin: `${API_BASE}/admins/login`,
      trainer: `${API_BASE}/trainers/login`,
      member: `${API_BASE}/members/login`,
    };

    if (!endpointMap[role]) {
      showToast("Please select a valid role.", "error");
      return;
    }

    try {
      const response = await fetch(endpointMap[role], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      const payload = {
        role,
        user: data.member || data.trainer || data.admin,
      };
      localStorage.setItem("gymUser", JSON.stringify(payload));
      showToast("Login successful.", "success");

      setTimeout(() => {
        if (role === "admin") window.location.href = "admin-dashboard.html";
        if (role === "trainer") window.location.href = "trainer-dashboard.html";
        if (role === "member") window.location.href = "dashboard.html";
      }, 700);
    } catch (error) {
      showToast(error.message || "Unable to login.", "error");
    }
  });
}

function setupResetPassword() {
  const resetForm = document.getElementById("resetPasswordForm");
  if (!resetForm) {
    return;
  }

  resetForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("resetEmail").value.trim();
    const newPassword = document.getElementById("newPassword").value;

    try {
      const response = await fetch(`${API_BASE}/members/update-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Password update failed");
      }

      showToast("Password updated successfully. Please log in with the new password.", "success");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 900);
    } catch (error) {
      showToast(error.message || "Unable to update password.", "error");
    }
  });
}

function setupTrainerResetPassword() {
  const resetForm = document.getElementById("resetTrainerPasswordForm");
  if (!resetForm) {
    return;
  }

  resetForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("resetTrainerEmail").value.trim();
    const newPassword = document.getElementById("resetTrainerNewPassword").value;

    try {
      const response = await fetch(`${API_BASE}/trainers/update-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Password update failed");
      }

      showToast("Trainer password updated successfully. Please log in now.", "success");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 900);
    } catch (error) {
      showToast(error.message || "Unable to update trainer password.", "error");
    }
  });
}

async function setupMemberDashboard() {
  const memberWelcome = document.getElementById("memberWelcome");
  if (!memberWelcome) {
    return;
  }

  const session = getSession("member");
  if (!session) {
    return;
  }

  bindLogout();
  bindMemberProfileEditor(session.user._id);

  try {
    const memberId = session.user._id;
    const [member, attendance, dietPlans, progress, trend] = await Promise.all([
      fetchJson(`${API_BASE}/members/${memberId}`),
      fetchJson(`${API_BASE}/attendance/member/${memberId}`),
      fetchJson(`${API_BASE}/dietplans/member/${memberId}`),
      fetchJson(`${API_BASE}/progress/member/${memberId}`),
      fetchJson(`${API_BASE}/progress/trend/${memberId}`),
    ]);

    memberWelcome.textContent = `Welcome, ${member.name}`;
    document.getElementById("trainerName").textContent = member.trainer?.name || "Not Assigned";
    document.getElementById("attendanceTotal").textContent = attendance.length;
    document.getElementById("dietPlanTotal").textContent = dietPlans.length;
    document.getElementById("progressTotal").textContent = progress.length;

    renderProfile(member);
    renderDietPlans(dietPlans);
    renderAttendance(attendance);
    renderProgress(progress);
    renderProgressChart(trend, member);

    localStorage.setItem("gymUser", JSON.stringify({ ...session, user: member }));
  } catch (error) {
    showToast(error.message || "Unable to load dashboard.", "error");
  }
}

function renderProfile(member) {
  const profile = document.getElementById("memberProfile");
  const bmiStatus = getBmiStatus(member.bmi);
  profile.innerHTML = `
    <div><span>Name</span><strong>${member.name}</strong></div>
    <div><span>Email</span><strong>${member.email}</strong></div>
    <div><span>Phone</span><strong>${member.phone}</strong></div>
    <div><span>Gender</span><strong>${member.gender}</strong></div>
    <div><span>Age</span><strong>${member.age}</strong></div>
    <div><span>Joined</span><strong>${formatDate(member.joinDate)}</strong></div>
    <div><span>Address</span><strong>${member.address}</strong></div>
    <div><span>Trainer</span><strong>${member.trainer?.name || "Pending assignment"}</strong></div>
    <div><span>Height</span><strong>${member.height ? `${member.height} cm` : "Not added"}</strong></div>
    <div><span>Weight</span><strong>${member.weight ? `${member.weight} kg` : "Not added"}</strong></div>
    <div><span>BMI</span><strong>${member.bmi || "Not available"}</strong></div>
    <div><span>BMI Status</span><strong>${bmiStatus}</strong></div>
  `;

  populateProfileForm(member);
}

function renderDietPlans(dietPlans) {
  const container = document.getElementById("dietPlans");
  if (!container) return;

  if (!dietPlans.length) {
    container.innerHTML = `<p class="empty-state">No diet plan added yet.</p>`;
    return;
  }

  container.innerHTML = dietPlans
    .map(
      (plan) => `
        <article class="mini-card">
          <h3>${plan.goal}</h3>
          <p>${plan.planDetails}</p>
          <small>Trainer: ${plan.trainer?.name || "N/A"} | ${formatDate(plan.createdAT)}</small>
        </article>
      `
    )
    .join("");
}

function renderAttendance(records) {
  const rows = document.getElementById("attendanceRows");
  rows.innerHTML = records.length
    ? records
        .map(
          (item) => `
            <tr>
              <td>${formatDate(item.date)}</td>
              <td>${item.status}</td>
              <td>${item.trainer?.name || "N/A"}</td>
            </tr>
          `
        )
        .join("")
    : `<tr><td colspan="3">No attendance data found.</td></tr>`;
}

function renderProgress(records) {
  const rows = document.getElementById("progressRows");
  rows.innerHTML = records.length
    ? records
        .map(
          (item) => `
            <tr>
              <td>${formatDate(item.date)}</td>
              <td>${item.weight} kg</td>
              <td>${item.height} cm</td>
              <td>${item.bmi}</td>
              <td>${item.progressType}</td>
              <td>${item.notes || "-"}</td>
            </tr>
          `
        )
        .join("")
    : `<tr><td colspan="6">No progress entries found.</td></tr>`;
}

function renderProgressChart(trend, member) {
  const canvas = document.getElementById("progressChart");
  const progressHint = document.getElementById("progressHint");
  if (!canvas) return;

  let labels = trend.labels || [];
  let weights = trend.weights || [];

  if (!weights.length && member.weight) {
    labels = ["Current Weight"];
    weights = [member.weight];
    if (progressHint) {
      progressHint.textContent = "No progress history yet, so the chart is showing only the current profile weight.";
    }
  } else if (progressHint) {
    progressHint.textContent = weights.length
      ? "Weight progress is plotted from saved progress records over time."
      : "Add your weight in profile or save progress records to see the chart.";
  }

  if (memberProgressChart) {
    memberProgressChart.destroy();
  }

  memberProgressChart = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Weight (kg)",
          data: weights,
          borderColor: "#ff7a18",
          backgroundColor: "rgba(255, 122, 24, 0.18)",
          fill: true,
          tension: 0.3,
          pointRadius: 4,
        },
      ],
    },
    options: {
      plugins: { legend: { display: true } },
      scales: {
        x: { ticks: { color: "#d7dbdf" } },
        y: { ticks: { color: "#d7dbdf" } },
      },
    },
  });
}

function bindMemberProfileEditor(memberId) {
  const form = document.getElementById("memberProfileForm");
  const toggleBtn = document.getElementById("toggleProfileEditBtn");
  const modal = document.getElementById("memberProfileModal");
  const closeBtn = document.getElementById("closeMemberProfileModal");
  if (!form || !toggleBtn) {
    return;
  }

  toggleBtn.addEventListener("click", () => {
    modal?.classList.remove("hidden-form");
  });

  closeBtn?.addEventListener("click", () => modal?.classList.add("hidden-form"));

  document.getElementById("editHeight")?.addEventListener("input", updateBmiPreview);
  document.getElementById("editWeight")?.addEventListener("input", updateBmiPreview);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`${API_BASE}/members/${memberId}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: document.getElementById("editName").value.trim(),
          phone: document.getElementById("editPhone").value.trim(),
          age: Number(document.getElementById("editAge").value),
          gender: document.getElementById("editGender").value,
          address: document.getElementById("editAddress").value.trim(),
          height: document.getElementById("editHeight").value,
          weight: document.getElementById("editWeight").value,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update profile.");
      }

      const session = getSession("member");
      localStorage.setItem("gymUser", JSON.stringify({ ...session, user: data.member }));
      renderProfile(data.member);
      document.getElementById("trainerName").textContent = data.member.trainer?.name || "Not Assigned";
      await refreshMemberProgress(memberId, data.member);
      showToast(`Profile updated. Current BMI: ${data.member.bmi || "Not available"}`, "success");
      modal?.classList.add("hidden-form");
    } catch (error) {
      showToast(error.message || "Unable to update profile.", "error");
    }
  });
}

async function refreshMemberProgress(memberId, member) {
  try {
    const [progress, trend] = await Promise.all([
      fetchJson(`${API_BASE}/progress/member/${memberId}`),
      fetchJson(`${API_BASE}/progress/trend/${memberId}`),
    ]);

    document.getElementById("progressTotal").textContent = progress.length;
    renderProgress(progress);
    renderProgressChart(trend, member);
  } catch (error) {
    showToast(error.message || "Profile saved, but progress chart could not refresh.", "error");
  }
}

function populateProfileForm(member) {
  const form = document.getElementById("memberProfileForm");
  if (!form) {
    return;
  }

  document.getElementById("editName").value = member.name || "";
  document.getElementById("editPhone").value = member.phone || "";
  document.getElementById("editAge").value = member.age || "";
  document.getElementById("editGender").value = member.gender || "other";
  document.getElementById("editAddress").value = member.address || "";
  document.getElementById("editHeight").value = member.height || "";
  document.getElementById("editWeight").value = member.weight || "";
  updateBmiPreview(member.bmi);
}

function updateBmiPreview(existingBmi) {
  const preview = document.getElementById("bmiPreview");
  if (!preview) {
    return;
  }

  if (typeof existingBmi === "number") {
    preview.textContent = `BMI: ${existingBmi}`;
    return;
  }

  const height = Number(document.getElementById("editHeight")?.value);
  const weight = Number(document.getElementById("editWeight")?.value);

  if (!height || !weight) {
    preview.textContent = "BMI: Not available";
    return;
  }

  const bmi = weight / Math.pow(height / 100, 2);
  preview.textContent = `BMI: ${bmi.toFixed(2)}`;
}

function getBmiStatus(bmi) {
  if (!bmi) {
    return "Not available";
  }

  if (bmi < 18.5) {
    return "Underweight";
  }

  if (bmi < 25) {
    return "Normal";
  }

  if (bmi < 30) {
    return "Overweight";
  }

  return "Obese";
}

function getSession(role) {
  const raw = localStorage.getItem("gymUser");
  if (!raw) {
    window.location.href = "index.html";
    return null;
  }

  const session = JSON.parse(raw);
  if (role && session.role !== role) {
    window.location.href = "index.html";
    return null;
  }

  return session;
}

function bindLogout() {
  const button = document.getElementById("logoutBtn");
  if (!button) return;

  button.addEventListener("click", () => {
    localStorage.removeItem("gymUser");
    window.location.href = "index.html";
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

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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
