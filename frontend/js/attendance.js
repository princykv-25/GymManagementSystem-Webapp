const API_BASE = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", async () => {
  const session = JSON.parse(localStorage.getItem("gymUser") || "null");
  if (!session || session.role !== "admin") {
    window.location.href = "index.html";
    return;
  }

  const records = await fetchJson(`${API_BASE}/attendance`);
  const rows = document.getElementById("attendanceAdminRows");
  rows.innerHTML = records.length
    ? records
        .map(
          (record) => `
            <tr>
              <td>${record.member?.name || "N/A"}</td>
              <td>${record.trainer?.name || "N/A"}</td>
              <td>${formatDate(record.date)}</td>
              <td>${record.status}</td>
            </tr>
          `
        )
        .join("")
    : `<tr><td colspan="4">No attendance records found.</td></tr>`;
});

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
