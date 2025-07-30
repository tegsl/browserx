function extractJobTitle() {
  const headings = document.querySelectorAll("h1, h2, .job-title");
  for (let h of headings) {
    if (h.innerText.length > 3) return h.innerText.trim();
  }
  return "";
}

function extractYearsExperience() {
  const text = document.body.innerText;
  const match = text.match(/(\d+)\+?\s+(years|yrs).*experience/i);
  return match ? match[1] : "";
}

function extractEmail() {
  const body = document.body.innerText;
  const match = body.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/);
  return match ? match[0] : "";
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "EXTRACT_DATA") {
    sendResponse({
      jobTitle: extractJobTitle(),
      yearsExperience: extractYearsExperience(),
      accountUsed: extractEmail()
    });
  }
});
