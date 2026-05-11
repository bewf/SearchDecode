const left = document.getElementById("left");
const right = document.getElementById("right");

let mode = "url_only";

function render() {
  if (mode === "all") {
    right.className = "half active";
    left.className = "half inactive";
  } else {
    left.className = "half active";
    right.className = "half inactive";
  }
}

function setMode(newMode) {
  mode = newMode;

  browser.storage.local.set({
    mode: mode
  });

  render();
}

browser.storage.local.get("mode").then((res) => {
  mode = res.mode || "url_only";
  render();
});

left.addEventListener("click", () => {
  setMode("url_only");
});

right.addEventListener("click", () => {
  setMode("all");
});