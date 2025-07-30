document.addEventListener("DOMContentLoaded", () => {
  const sheetUrlInput = document.getElementById("sheetUrl");

  chrome.storage.local.get("sheetUrl", (data) => {
    sheetUrlInput.value = data.sheetUrl || "";
  });

  document.getElementById("saveBtn").addEventListener("click", () => {
    chrome.storage.local.set({ sheetUrl: sheetUrlInput.value }, () => {
      document.getElementById("status").textContent = "Saved!";
    });
  });
});
