const API_BASE = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("memberRegisterForm")?.addEventListener("submit", registerMember);
  document.getElementById("trainerRegisterForm")?.addEventListener("submit", registerTrainer);
});

async function registerMember(event) {
  event.preventDefault();

  const payload = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    password: document.getElementById("password").value.trim(),
    age: Number(document.getElementById("age").value),
    gender: document.getElementById("gender").value,
    address: document.getElementById("address").value.trim(),
  };

  const session = JSON.parse(localStorage.getItem("gymUser") || "null");
  const redirectPath = session?.role === "admin" ? "manage-members.html" : "index.html";

  await submitForm(
    `${API_BASE}/members/register`,
    payload,
    "Member added successfully.",
    redirectPath
  );
}

async function registerTrainer(event) {
  event.preventDefault();

  const specializations = Array.from(
    document.querySelectorAll('input[name="specialization"]:checked')
  ).map((item) => item.value);

  if (!specializations.length) {
    showToast("Please select at least one specialization.", "error");
    return;
  }

  const payload = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    password: document.getElementById("password").value.trim(),
    experience: Number(document.getElementById("experience").value),
    specialization: specializations,
    bio: document.getElementById("bio").value.trim(),
  };

  await submitForm(
    `${API_BASE}/trainers/register`,
    payload,
    "Trainer registered successfully.",
    "index.html"
  );
}

async function submitForm(url, payload, successMessage, redirectPath) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }

    showToast(successMessage, "success");
    setTimeout(() => {
      window.location.href = redirectPath;
    }, 800);
  } catch (error) {
    showToast(formatRegistrationError(error.message), "error");
  }
}

function formatRegistrationError(message) {
  if (!message) {
    return "Unable to submit the form right now.";
  }

  if (message.includes("duplicate key error") && message.includes("email")) {
    return "This email is already registered. Please use a different email or log in.";
  }

  if (message.toLowerCase().includes("validation")) {
    return "Please check the form details and try again.";
  }

  return message;
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
