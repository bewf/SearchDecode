let mode = "url_only";
let enabled = true;

// load saved settings
browser.storage.local.get(["mode", "enabled"]).then((res) => {
  mode = res.mode || "url_only";
  enabled = res.enabled !== undefined ? res.enabled : true;
});

// live updates
browser.storage.onChanged.addListener((changes) => {
  if (changes.mode) {
    mode = changes.mode.newValue;
  }
  if (changes.enabled) {
    enabled = changes.enabled.newValue;
  }
});

function decodeBase64(str) {
  try {
    return decodeURIComponent(escape(atob(str))).trim();
  } catch {
    return null;
  }
}

function isLikelyUrl(str) {
  // supports:
  // https://example.com
  // http://example.com
  // www.example.com
  // example.com/path
  return /^(https?:\/\/|www\.|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/.test(str);
}

function normalizeUrl(str) {
  if (!str.startsWith("http://") && !str.startsWith("https://")) {
    return "https://" + str;
  }
  return str;
}

function getFallbackSearchUrl(originUrl, query) {
  const encoded = encodeURIComponent(query);
  if (originUrl.includes("duckduckgo.com")) {
    return "https://duckduckgo.com/?q=" + encoded;
  }
  if (originUrl.includes("bing.com")) {
    return "https://www.bing.com/search?q=" + encoded;
  }
  return "https://www.google.com/search?q=" + encoded;
}

browser.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (!enabled) return;

    const currentUrl = new URL(details.url);
    const query = currentUrl.searchParams.get("q");
    if (!query) return;

    const decoded = decodeBase64(query);
    if (!decoded) return;

    // URL ONLY MODE
    if (mode === "url_only") {
      if (isLikelyUrl(decoded)) {
        return { redirectUrl: normalizeUrl(decoded) };
      }
      return;
    }

    // URL + TEXT MODE
    if (mode === "all") {
      if (isLikelyUrl(decoded)) {
        return { redirectUrl: normalizeUrl(decoded) };
      }
      return { redirectUrl: getFallbackSearchUrl(details.url, decoded) };
    }
  },
  {
    urls: [
      "*://www.google.com/search*",
      "*://www.bing.com/search*",
      "*://duckduckgo.com/?*"
    ]
  },
  ["blocking"]
);