const API_BASE = "http://localhost:5000/api";
let trainersCache = [];

document.addEventListener("DOMContentLoaded", async () => {
  const session = JSON.parse(localStorage.getItem("gymUser") || "null");
  if (!session || session.role !== "admin") {
    window.location.href = "index.html";
    return;
  }

  bindTrainerEditModal();
  await loadTrainers();
});

async function loadTrainers() {
  const trainers = await fetchJson(`${API_BASE}/trainers`);
  trainersCache = trainers;
  const list = document.getElementById("trainerManagerList");

  list.innerHTML = trainers.length
    ? trainers
        .map(
          (trainer) => `
            <div class="action-item">
              <div>
                <strong>${trainer.name}</strong>
                <p>${trainer.email}</p>
                <p>${Array.isArray(trainer.specialization) ? trainer.specialization.join(", ") : trainer.specialization}</p>
              </div>
              <div class="inline-form">
                <button type="button" onclick="openTrainerEditModal('${trainer._id}')">Edit Trainer</button>
                <button type="button" class="secondary-btn" onclick="deleteTrainer('${trainer._id}')">Delete Trainer</button>
              </div>
            </div>
          `
        )
        .join("")
    : `<p class="empty-state">No trainers found.</p>`;
}

function bindTrainerEditModal() {
  const modal = document.getElementById("trainerEditModal");
  const closeBtn = document.getElementById("closeTrainerEditModal");
  const form = document.getElementById("adminTrainerEditForm");
  if (!modal || !closeBtn || !form) return;

  closeBtn.addEventListener("click", () => modal.classList.add("hidden-form"));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const trainerId = document.getElementById("adminEditTrainerId").value;
    const specialization = Array.from(
      document.querySelectorAll('input[name="adminTrainerSpecialization"]:checked')
    ).map((item) => item.value);

    if (!specialization.length) {
      showToast("Please select at least one specialization.", "error");
      return;
    }

    try {
      await fetchJson(`${API_BASE}/trainers/${trainerId}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: document.getElementById("adminEditTrainerName").value.trim(),
          phone: document.getElementById("adminEditTrainerPhone").value.trim(),
          experience: Number(document.getElementById("adminEditTrainerExperience").value),
          specialization,
          bio: document.getElementById("adminEditTrainerBio").value.trim(),
        }),
      });

      modal.classList.add("hidden-form");
      await loadTrainers();
      showToast("Trainer profile updated successfully.", "success");
    } catch (error) {
      showToast(error.message || "Unable to update trainer right now.", "error");
    }
  });
}

function openTrainerEditModal(trainerId) {
  const trainer = trainersCache.find((item) => item._id === trainerId);
  if (!trainer) return;

  document.getElementById("adminEditTrainerId").value = trainer._id;
  document.getElementById("adminEditTrainerName").value = trainer.name || "";
  document.getElementById("adminEditTrainerPhone").value = trainer.phone || "";
  document.getElementById("adminEditTrainerExperience").value = trainer.experience || 0;
  document.getElementById("adminEditTrainerBio").value = trainer.bio || "";

  document
    .querySelectorAll('input[name="adminTrainerSpecialization"]')
    .forEach((checkbox) => {
      checkbox.checked = (trainer.specialization || []).includes(checkbox.value);
    });

  document.getElementById("trainerEditModal").classList.remove("hidden-form");
}

async function deleteTrainer(trainerId) {
  try {
    await fetchJson(`${API_BASE}/trainers/${trainerId}`, {
      method: "DELETE",
    });
    await loadTrainers();
    showToast("Trainer deleted successfully.", "success");
  } catch (error) {
    showToast(error.message || "Unable to delete trainer right now.", "error");
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
