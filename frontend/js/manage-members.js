const API_BASE = "http://localhost:5000/api";
let membersCache = [];

document.addEventListener("DOMContentLoaded", async () => {
  const session = JSON.parse(localStorage.getItem("gymUser") || "null");
  if (!session || session.role !== "admin") {
    window.location.href = "index.html";
    return;
  }

  bindMemberEditModal();
  await Promise.all([loadLatestMembers(), loadUnassignedMembers()]);
});

async function loadLatestMembers() {
  const [members, trainers] = await Promise.all([
    fetchJson(`${API_BASE}/members`),
    fetchJson(`${API_BASE}/trainers`),
  ]);
  membersCache = members;
  const list = document.getElementById("recentMembers");

  list.innerHTML = members.length
    ? members
        .map(
          (member) => `
            <li>
              <strong>${member.name}</strong>
              <span>${member.email}</span>
              <span>Current Trainer: ${member.trainer?.name || "No trainer assigned"}</span>
              <div class="inline-form">
                <select id="reassignTrainerSelect-${member._id}">
                  <option value="">Select Trainer</option>
                  ${trainers
                    .map((trainer) => `<option value="${trainer._id}" ${member.trainer?._id === trainer._id ? "selected" : ""}>${trainer.name}</option>`)
                    .join("")}
                </select>
                <button type="button" onclick="assignTrainer('${member._id}', 'reassignTrainerSelect-${member._id}')">
                  ${member.trainer ? "Reassign" : "Assign"}
                </button>
                ${member.trainer ? `<button type="button" class="secondary-btn" onclick="removeTrainer('${member._id}')">Remove Trainer</button>` : ""}
                <button type="button" class="secondary-btn" onclick="openMemberEditModal('${member._id}')">Edit Member</button>
                <button type="button" class="secondary-btn" onclick="deleteMember('${member._id}')">Delete Member</button>
              </div>
            </li>
          `
        )
        .join("")
    : `<li>No members found.</li>`;
}

async function loadUnassignedMembers() {
  const [members, trainers] = await Promise.all([
    fetchJson(`${API_BASE}/members/unassigned`),
    fetchJson(`${API_BASE}/trainers`),
  ]);
  const container = document.getElementById("unassignedMembers");

  if (!members.length) {
    container.innerHTML = `<p class="empty-state">All members already have trainers.</p>`;
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
            <button type="button" onclick="assignTrainer('${member._id}', 'trainerSelect-${member._id}')">Assign</button>
          </div>
        </div>
      `
    )
    .join("");
}

function bindMemberEditModal() {
  const modal = document.getElementById("memberEditModal");
  const closeBtn = document.getElementById("closeMemberEditModal");
  const form = document.getElementById("adminMemberEditForm");
  if (!modal || !closeBtn || !form) return;

  closeBtn.addEventListener("click", () => modal.classList.add("hidden-form"));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const memberId = document.getElementById("adminEditMemberId").value;

    try {
      await fetchJson(`${API_BASE}/members/${memberId}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: document.getElementById("adminEditMemberName").value.trim(),
          phone: document.getElementById("adminEditMemberPhone").value.trim(),
          age: Number(document.getElementById("adminEditMemberAge").value),
          gender: document.getElementById("adminEditMemberGender").value,
          address: document.getElementById("adminEditMemberAddress").value.trim(),
          height: document.getElementById("adminEditMemberHeight").value,
          weight: document.getElementById("adminEditMemberWeight").value,
        }),
      });

      modal.classList.add("hidden-form");
      await Promise.all([loadLatestMembers(), loadUnassignedMembers()]);
      showToast("Member profile updated successfully.", "success");
    } catch (error) {
      showToast(error.message || "Unable to update member right now.", "error");
    }
  });
}

function openMemberEditModal(memberId) {
  const member = membersCache.find((item) => item._id === memberId);
  if (!member) return;

  document.getElementById("adminEditMemberId").value = member._id;
  document.getElementById("adminEditMemberName").value = member.name || "";
  document.getElementById("adminEditMemberPhone").value = member.phone || "";
  document.getElementById("adminEditMemberAge").value = member.age || "";
  document.getElementById("adminEditMemberGender").value = member.gender || "other";
  document.getElementById("adminEditMemberAddress").value = member.address || "";
  document.getElementById("adminEditMemberHeight").value = member.height || "";
  document.getElementById("adminEditMemberWeight").value = member.weight || "";
  document.getElementById("memberEditModal").classList.remove("hidden-form");
}

async function assignTrainer(memberId, selectId) {
  const trainerId = document.getElementById(selectId).value;
  if (!trainerId) {
    showToast("Please select a trainer before assigning.", "error");
    return;
  }

  try {
    await fetchJson(`${API_BASE}/members/${memberId}/assign-trainer/${trainerId}`, {
      method: "PUT",
    });
    await Promise.all([loadLatestMembers(), loadUnassignedMembers()]);
    showToast("Trainer assigned successfully.", "success");
  } catch (error) {
    showToast(error.message || "Unable to assign trainer right now.", "error");
  }
}

async function removeTrainer(memberId) {
  try {
    await fetchJson(`${API_BASE}/members/${memberId}/remove-trainer`, {
      method: "PUT",
    });
    await Promise.all([loadLatestMembers(), loadUnassignedMembers()]);
    showToast("Trainer removed successfully.", "success");
  } catch (error) {
    showToast(error.message || "Unable to remove trainer right now.", "error");
  }
}

async function deleteMember(memberId) {
  try {
    await fetchJson(`${API_BASE}/members/${memberId}`, {
      method: "DELETE",
    });
    await Promise.all([loadLatestMembers(), loadUnassignedMembers()]);
    showToast("Member deleted successfully.", "success");
  } catch (error) {
    showToast(error.message || "Unable to delete member right now.", "error");
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
