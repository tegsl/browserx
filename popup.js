document.addEventListener("DOMContentLoaded", async () => {
  const tab = await getCurrentTab();

  // Get current page info from content script
  chrome.tabs.sendMessage(tab.id, { type: "EXTRACT_DATA" }, (response) => {
    document.getElementById("jobTitle").value = response?.jobTitle || "";
    document.getElementById("yearsExperience").value = response?.yearsExperience || "";
    document.getElementById("accountUsed").value = response?.accountUsed || "";
  });

  document.getElementById("saveBtn").addEventListener("click", async () => {
    const jobData = {
      jobTitle: document.getElementById("jobTitle").value,
      yearsExperience: document.getElementById("yearsExperience").value,
      accountUsed: document.getElementById("accountUsed").value,
      passwordHint: document.getElementById("passwordHint").value,
      orgTag: document.getElementById("orgTag").value,
      url: tab.url,
      dateTime: new Date().toLocaleString()
    };

    // Save locally
    chrome.storage.local.get({ jobs: [] }, (data) => {
      const jobs = data.jobs;
      jobs.push(jobData);
      chrome.storage.local.set({ jobs });
    });

    // Push to Google Sheet
    chrome.storage.local.get("sheetUrl", ({ sheetUrl }) => {
      if (!sheetUrl) {
        document.getElementById("status").textContent = "Set Google Sheet URL in options.";
        return;
      }

      fetch(sheetUrl, {
        method: "POST",
        body: JSON.stringify(jobData),
        headers: {
          "Content-Type": "application/json"
        }
      })
        .then(() => {
          document.getElementById("status").textContent = "Saved!";
        })
        .catch(() => {
          document.getElementById("status").textContent = "Error saving to sheet.";
        });
    });
  });

  document.getElementById("exportBtn").addEventListener("click", () => {
    chrome.storage.local.get("jobs", (data) => {
      const rows = data.jobs || [];
      const header = [
        "Job Title",
        "Years Experience",
        "Account Used",
        "Password Hint",
        "Organizational Tag",
        "URL",
        "DateTime"
      ];
      const csvContent = [header, ...rows.map(obj => [
        obj.jobTitle,
        obj.yearsExperience,
        obj.accountUsed,
        obj.passwordHint,
        obj.orgTag,
        obj.url,
        obj.dateTime
      ])]
        .map(e => e.map(x => `"${x}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "job_applications.csv";
      link.click();
    });
  });
});

function getCurrentTab() {
  return new Promise((resolve) =>
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => resolve(tabs[0]))
  );
}
