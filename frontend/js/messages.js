const API_BASE = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", async () => {
  const session = JSON.parse(localStorage.getItem("gymUser") || "null");
  if (!session) {
    window.location.href = "index.html";
    return;
  }

  const backLink = document.getElementById("messagesBackLink");
  backLink.href =
    session.role === "admin"
      ? "admin-dashboard.html"
      : session.role === "trainer"
      ? "trainer-dashboard.html"
      : "dashboard.html";

  document.getElementById("recipientRole").addEventListener("change", () => loadRecipients());
  document.getElementById("messageForm").addEventListener("submit", (event) => submitMessage(event, session));

  await loadRecipients();
  await loadMessages(session);
});

async function loadRecipients() {
  const session = JSON.parse(localStorage.getItem("gymUser") || "null");
  const role = document.getElementById("recipientRole").value;
  const select = document.getElementById("recipientUser");

  if (!role) {
    select.innerHTML = `<option value="">Select Recipient</option>`;
    return;
  }

  const endpointMap = {
    admin: `${API_BASE}/admins`,
    trainer: `${API_BASE}/trainers`,
    member: `${API_BASE}/members`,
  };

  select.innerHTML = `<option value="">Loading recipients...</option>`;

  try {
    const users = await fetchJson(endpointMap[role]);
    const filtered = users.filter((user) => !(role === session.role && user._id === session.user._id));

    select.innerHTML = filtered.length
      ? `<option value="">Select Recipient</option>${filtered
          .map((user) => `<option value="${user._id}" data-name="${user.name}">${user.name} (${user.email})</option>`)
          .join("")}`
      : `<option value="">No recipients available</option>`;
  } catch (error) {
    select.innerHTML = `<option value="">Unable to load recipients</option>`;
    showToast(error.message || "Unable to load recipients.", "error");
  }
}

async function loadMessages(session) {
  const list = document.getElementById("messageList");

  try {
    const messages = await fetchJson(`${API_BASE}/messages?role=${session.role}&userId=${session.user._id}`);

    list.innerHTML = messages.length
      ? messages
          .map((message) => {
            const isSender = message.senderRole === session.role && message.senderId === session.user._id;
            return `
              <article class="mini-card">
                <h3>${isSender ? `To ${message.recipientName}` : `From ${message.senderName}`}</h3>
                <p>${message.content}</p>
                <small>${isSender ? "Sent" : "Received"} | ${formatDateTime(message.createdAt)}</small>
              </article>
            `;
          })
          .join("")
      : `<p class="empty-state">No messages yet.</p>`;
  } catch (error) {
    list.innerHTML = `<p class="empty-state">Unable to load inbox. Please restart the backend if this page was just added.</p>`;
    showToast(error.message || "Unable to load inbox.", "error");
  }
}

async function submitMessage(event, session) {
  event.preventDefault();

  const recipientRole = document.getElementById("recipientRole").value;
  const recipientSelect = document.getElementById("recipientUser");
  const recipientId = recipientSelect.value;
  const recipientName = recipientSelect.options[recipientSelect.selectedIndex]?.dataset.name;
  const content = document.getElementById("messageContent").value.trim();

  if (!recipientRole || !recipientId || !content) {
    showToast("Please choose a recipient and enter a message.", "error");
    return;
  }

  try {
    await fetchJson(`${API_BASE}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderRole: session.role,
        senderId: session.user._id,
        senderName: session.user.name,
        recipientRole,
        recipientId,
        recipientName,
        content,
      }),
    });

    document.getElementById("messageForm").reset();
    document.getElementById("recipientUser").innerHTML = `<option value="">Select Recipient</option>`;
    await loadMessages(session);
    showToast("Message sent successfully.", "success");
  } catch (error) {
    showToast(error.message || "Unable to send message right now.", "error");
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

function formatDateTime(value) {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
