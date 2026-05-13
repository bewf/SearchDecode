const left = document.getElementById("left");
const right = document.getElementById("right");
const enabledButton = document.getElementById("enabledButton");

let mode = "url_only";
let enabled = true;

function render() {
  if (enabled) {
    enabledButton.className = "button enabled";
    enabledButton.textContent = "ENABLED";
  } else {
    enabledButton.className = "button disabled";
    enabledButton.textContent = "DISABLED";
  }

  if (mode === "all") {
    right.className = "half active";
    left.className = "half inactive";
  } else {
    left.className = "half active";
    right.className = "half inactive";
  }
}

function save() {
  chrome.storage.local.set({ mode, enabled });
}

chrome.storage.local.get(["mode", "enabled"]).then((res) => {
  mode = res.mode || "url_only";
  enabled = res.enabled !== undefined ? res.enabled : true;
  render();
});

enabledButton.addEventListener("click", () => {
  enabled = !enabled;
  save();
  render();
});

left.addEventListener("click", () => {
  mode = "url_only";
  save();
  render();
});

right.addEventListener("click", () => {
  mode = "all";
  save();
  render();
});